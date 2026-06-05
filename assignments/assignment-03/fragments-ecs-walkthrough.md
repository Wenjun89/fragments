# Elastic Container Service (ECS), GitHub Actions, and fragments Walk-Through

This will guide you through setting up [Amazon Elastic Container Service (ECS)](https://aws.amazon.com/ecs/) for your `fragments` microservice, and do auto-deployments via git tags and GitHub Actions.

This walkthrough touches on many new technologies, services, and techniques. Take your time with it and ask questions on the discussions if you get stuck.

Also, the resources we will create in this walkthrough will start to use your AWS credits much more quickly. Keep an eye on your spending.

> [!IMPORTANT]
> To reduce costs and keep your spending within budget, please do not use ECS until you are ready to work on Assignment 3. It is not needed for the labs.

## A note about Environment Variables and Logging

Students working on this part of the project often struggle to get their apps properly deployed. There can be many reasons for this, but two that come up a lot are:

1. Not understanding how to properly use **Environment Variables** and which values to set
2. Not including sufficient **Logging** in order to debug problems in the deployed system

Before you continue, it is recommended that you take a moment to prepare and make sure you have a good handle on the above. Here are some questions you should ask yourself:

1. What is the list of Environment Variables (and their values) that I need to set in order to run my `fragments` container in production (e.g., how did you do it on EC2)? For example: Make sure you have the proper variables/values for your Cognito auth provider. Make sure you can run your container and know all the variables to set.
2. Have I included `logger.debug()` messages in places where I need to know when something is happening my code? It's worth adding more! Remember: you only see debug messages if you set `FRAGMENTS_LOG_LEVEL=debug` in your environment (I would suggest you do this while you are debugging).
3. Have I included `logger.error()` messages in places where things fail? Add more. You won't regret having this info.

Automating the deployment and management of an app in production, as we are about to do, is complicated. If you don't have a solid understanding of the above, it becomes quite difficult to understand and debug your issues.

## 1. Amazon Elastic Container Service (ECS)

For our AWS deployments, we're going to use [Amazon ECS](https://aws.amazon.com/ecs/) in order to manage our container. To begin, we'll manually deploy our app's Docker image to [Amazon ECS](https://aws.amazon.com/ecs/). Once that's running smoothly, we'll automate the process using git, GitHub and GitHub Actions.

Before we start, we'll update our health check code slightly to make it easier to test what we're going to do below. With ECS we're going to use a Load Balancer, and it's helpful to see how they work. To do that, we'll modify our health check route so that it also returns the `hostname` of the server on which it is running.

In `src/routes/index.js`, use the built-in [`os.hostname()` function](https://nodejs.org/api/os.html#oshostname) to get the server's hostname and add it to the JSON we return for the health check:

```js
// src/routes/index.js

// ...
const { hostname } = require('os');
// ...

router.get('/', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.status(200).json(
    createSuccessResponse({
      description: 'fragments service running normally',
      author,
      // TODO: change this to use your GitHub username!
      githubUrl: 'https://github.com/REPLACE_WITH_YOUR_GITHUB_USERNAME/fragments',
      version,
      timestamp: new Date().toISOString(),
      // Include the hostname in the response
      hostname: hostname(),
    })
  );
});
```

Test this change locally, and once it's working, `add` and `commit` it to git, then `push` to GitHub and have your CI Workflow **build** and **push** a new Docker Image to Docker Hub. We'll use that image (i.e., the `:latest` tag) below for our setup.

### 1.1 Introducing ECS

[Amazon ECS](https://aws.amazon.com/ecs/) is a fully managed container orchestration service. It's a platform for taking our Docker Images and doing all of the following (and more!):

- Deploying our images to run as containers
- Provisioning cloud compute, network, storage, and other resources
- Managing these containers (e.g., restarting crashed containers)
- Scaling the number of containers running at any given moment based on load
- Monitoring our containers
- Managing updates (deployments)

When your application is containerized, you need a **container orchestration** platform to automate the scheduling (i.e., deployment, running, updates) of your containers on servers, manage the network, restart or scale instances, handle versions and deployments, etc.

There are many container orchestration platforms. The most popular is [Kubernetes](https://kubernetes.io/). Kubernetes is used at many big companies, but it also adds a lot of extra complexity that is outside the scope of this course--you might choose to study Kubernetes as a follow-up to this course (NOTE: Amazon also offers managed Kubernetes via the [Elastic Kubernetes Service (EKS)](https://aws.amazon.com/eks/)). Instead, we're going to use Amazon's simpler container orchestrator, [Amazon ECS](https://aws.amazon.com/ecs/), which solves the same problems as Kubernetes, but delays dealing with some of the complexity that Kubernetes brings with its increased flexibility.

Both ECS and EKS are often referred to as a "control plane," since they sit on top of, and manage, server instances for us: in order to run container workloads, we need to provision and manage cloud instances. ECS can use EC2 instances directly (i.e., self-managed) or via the serverless [Fargate](https://aws.amazon.com/fargate/) platform (i.e., fully managed). With Fargate we don't have to work directly with the VM or OS. We'll focus on using Fargate.

### 1.2 Fargate

[Fargate](https://aws.amazon.com/fargate/) is a serverless, pay-as-you-go compute engine for managing servers. We use Fargate in conjunction with container orchestration platforms (ECS or EKS) to manage the server resources necessary to run our containers. With Fargate, we don't need to provision, manage, secure, scale, or interact directly with our compute tier--no more manual EC2 setup! Instead, we can focus solely on our containerized application.

Fargate makes things really easy, but isn't the right choice in all situations. For example, if you you need to have greater control over the OS or machine environment. In those cases, using EC2 directly gives more flexibility (you've already seen how you can manage an EC2 instance and its OS). However, with more flexibility comes more responsibility--you have to manage the machine, OS, packages, and security updates, yourself. For our use case, where we don't need to modify the underlying OS or compute environment, Fargate is perfect.

Fargate is priced based on the resources you reserve (billed by the minute): vCPU, memory, and storage. With EC2 we had to pick an entire virtual machine instance and it came with a specific amount of vCPU, RAM, and storage. For example, we've been using a [t2.micro](https://aws.amazon.com/ec2/instance-types/t2/) instance, which provides `1 vCPU` and `1 GiB RAM`. With Fargate, we can pay for _fractional units_ of compute, allowing us to reserve fewer resources. Fargate divides each vCPU into `1024 CPU Units`. We'll use 1/4 of a vCPU, which is `256 CPU Units` and 1/2 GiB of RAM, which is `512 MiB` of RAM.

This might sound underwhelming. How will we support all of our users on so few resources? The answer is horizontal scaling. Instead of picking a massive machine instance to scale our app (i.e., [vertical scaling](https://stackoverflow.com/questions/11707879/difference-between-scaling-horizontally-and-vertically-for-databases)), we're going to use a modest amount of compute resources (per instance) and scale up by adding as many parallel instances as are necessary to handle the load (horizontal scaling). When our app isn't busy, we might scale down to only have 1 container running; when things get busy, we could scale up to 10, 100, or 1,000 simultaneous instances.

### 1.3 Terminology

We'll be using some new terminology as we continue working with ECS, so it's helpful to define it first:

- **Container**, **Image**: These are the same Docker terms you already know. Images are built and pushed to, or pulled from a registry like Docker Hub or [Amazon Elastic Container Registry (ECR)](https://aws.amazon.com/ecr/). We'll use ECR for this walkthrough.
- **Task Definition**: A `JSON` file that describes one or more containers, resource parameters, and other runtime settings for an application. A task definition tells ECS how to run one or more container(s), specifying things like where to pull the image, how to map ports between the host and container, which environment variables to define, how much CPU/RAM to use, etc.
- **Task**: When we run a **Task Definition**, we create a **Task**. Think of a Task Definition like a class in OOP, and a Task like an object instance at runtime. Our container will run within a Task.
- **Service**: Tasks are owned and managed by a **Service**. The service is configured with information about how many tasks to run, and how to scale this number, how to handle networking, etc. The service also monitors the running task(s), and if one fails or stops, it schedules another, always maintaining the desired scaling level. Services also handle deployments of new versions for us.
- **Cluster**: A **Cluster** runs one or more **Services**. In ECS, a cluster is little more than a virtual container for all of our resources, and we tend to focus on Services and Tasks most of the time.

## 2. Manual ECS Setup

Now that we have a general idea of what ECS entails, we'll learn how it works by _manually_ setting-up an ECS Cluster, Service, and Task for our `fragments` microservice.

1. Open the **AWS Console**. Search for **Elastic Container Service**.
2. We'll need to define our **Container definition**, **Task definition**, **Service**, and **Cluster**, and we'll begin with the **Task Definition**.

### 2.1 Task Definition

As we said above, the **Task Definition** defines how to run our container with ECS. Let's create one for our `fragments` server:

1. In the **Amazon Elastic Container Service** console, choose **Task definitions** in the left-hand menu

#### 2.1.1 Task definition configuration

1. Click the **Create new task definition** button and **Create new task definition**.
2. In the **Task definition configuration**, give your new task definition a **family name**: `fragments-task`. This name will be the basis for the many individual task definition versions that we will create in the coming weeks.

#### 2.1.2 Infrastructure requirements

As we know from our work with EC2, running a container on AWS requires compute resources (e.g., EC2 instances), and these need to be provisioned and set with sufficient resources. Previously we did this manually, but now we will use the managed Fargate service to handle our compute.

1. Under **Infrastructure requirements** we specify the infrastructure computing needs for our task. We will be using **AWS Fargate** serverless compute and **Linux/X86_64** for our **Operating system/Architecture**.
2. For our **Task size**, we need to define how much **CPU** and **Memory** to allocate. To start, our needs are modest: we can use **.25 vCPU** and **.5 GB Memory**.
3. In terms of security, we need to define two different [IAM Roles](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html) within our AWS account. First, the **Task role** specifies the rights that the container running within the task will have (e.g., to be able to access other AWS resources in our account); second, the **Task execution role** specifies what rights that the ECS cluster and infrastructure will have (e.g., to access resources like our ECR repo). Set both of these roles to the pre-defined **LabRole** AWS Role, which will grant them access to any resources we own.

#### 2.1.3 Container - 1

Next we define the container (or containers if running multiple), that will be run in our task. This step is a bit like defining the options to pass to `docker run` on the command line.

> [!IMPORTANT]
> In order to make the following changes work, your Docker image needs to use the `root` user. If you have previously set `USER node` or similar, you'll need to remove this and use the default `root` user instead. This is necessary because we are going to use a privileged port (i.e., port below 1024), which requires elevated rights. You should make that change if necessary then push new images to your Docker registries. If you do not do this, your server will crash with an `EACCESS: permission denied 0.0.0.0:80` error when it tries to listen on port 80.

1. For the **Container details**, use a **Name** of `fragments-container`, an **Image URI** with your **Docker Hub** `fragments` image and the `latest` tag URI (i.e., `<your-hub.docker.com-username>/fragments:latest`), and specify `Yes` for **Essential container**, since we can't run our task without this container.
2. For the **Port mappings**, instead of using our usual development port `8080`, we'll use the production HTTP port, `80`. This is the default configuration: **Container port** is `80`, uses the `TCP` **Protocol**, and that the **App protocol** is `HTTP`. You can leave the **Port name** empty.
3. For the **Resource allocation limits**, specify the amount of **CPU**, `.25`, and **Memory**, `.5` for the **Memory soft limit**. This means your container will reserve `512 MiB` of RAM when it starts (a **Hard limit** would define the _maximum_ memory allowed, which we won't set).
4. Next, add all the necessary **Environment variables** you need to run your server, which will include overriding the server `PORT` to use `80` vs. the default `8080` we've been using. Each one of these environment variables will have a **Key** (e.g., `PORT`) and a **Value** (e.g. `80`). Remember that your server needs to be fully configured (e.g., auth with Cognito) to run properly, just like you did on EC2 or locally.

> [!TIP]
> Later, if your container/task won't start properly, it is often due to missing environment variables, so take your time with this step! We will be able to update these later if you make a mistake.

1. The default values for **Logging** are good. ECS will use the [Amazon CloudWatch](https://aws.amazon.com/cloudwatch/) service to collect our container logs into a [Log Group](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CloudWatchLogsConcepts.html) named `/ecs/fragments-task`. You should write this down for later, when you need to see the logs for your server.
2. The default values for **Storage** are also good, since we won't be storing our data on disk (i.e., currently we use an in-memory database and later we'll use Amazon database services).

Everything else should be good using the default configuration. You can now click the **Create** button.

Your `fragments-task` Task Definition is now created, and you can inspect or edit it at any time by coming back to **Amazon Elastic Container Service** > **Task definitions** > **fragments-task**. When you do make changes, a new version will be created (i.e., this first version is **Revision 1**, `fragments-task:1`).

> [!TIP]
> CloudWatch logs work best if you do NOT use `debug` log level and pretty-print the structured JSON. Ideally, you should use the `info` log level in production.

### 2.2 Cluster

Next we need to create a cluster where we can run our task.

> [!NOTE]
> The first time you try to create an ECS Cluster with your CloudLabs AWS account, you may receive an error (`Status Code: 400`) saying that the cluster couldn't be created due to being unable to assume a service linked role. The required role will be created on the first attempt, and the second time you try to create the cluster, it should work correctly.

1. Click the **Create cluster** button
2. Give your cluster a name: `fragments-cluster`
3. Under **Infrastructure**, choose **\*AWS Fargate (serverless)**
4. The default settings are good for all other options
5. Click the **Create** button

It will take a minute or two for the cluster to be fully created. Once it is, move on to create your **Service**.

### 2.3 Service

The final step is to create a **Service** within our cluster. A service is responsible for deploying, managing, and monitoring our tasks (and the containers they run).

Click on the newly created `fragments-cluster`, then under **Services**, click the **Create** button

#### 2.3.1 Environment

For our service's **Environment** we will use our **Existing cluster**, `fragments-cluster`. The **Compute configuration** should be set to `Launch Type` instead of the more advanced `Capacity provider strategy`. Our **Launch type** will be `FARGATE` and the **Platform version** will be `LATEST`. This will allow our service to directly launch instances via Fargate to run our tasks.

#### 2.3.2 Deployment configuration

1. For our service's **Deployment configuration**, we will choose an **Application type** of `Service`, since our server will be a long-running web app.
2. For the **Task definition**, choose the **Family** we created in the previous steps, `fragments-task`, and the only **Revision** we have, `1 (LATEST)`. Our service will use this task definition to create and manage our task for us.
3. Next, pick a unique **Service name**: `fragments-service`
4. We will use a **Service type** of `Replica`, which allows us to run multiple, simultaneous versions of our task for high-availability. To start, we'll choose to set the **Desired tasks** to `1` (i.e., only run a single task with a single instance of our server).

#### 2.3.3 Networking

Our ECS resources need to run within a Virtual Private Cloud (VPC). This is a private network where we can safely run the systems involved in our application, and then provide external/public access via a Load Balancer (we'll do that in a subsequent step).

1. Use the existing, default VPC already created for your account. It will look something like `vpc-0f7ad67fda91e636d`.
2. Choose the **Subnets** where our resources should be placed. By default, AWS resources are created in a **Region** (e.g., `us-east-2`), which is then divided into separate **Availability Zones (AZ)**. These AZs provide redundancy via separate data centres (i.e. our resources will run in multiple, physical locations so that if one data centre goes down, another can take over). For fault-tolerance, we need to use at least 2 AZs. Select `us-east-2a` and `us-east-2b`, but remove the rest in order to save cost.
3. Next, we need to create a **Security Group** to allow traffic to reach our private network (similar to what we did with our EC2 instances). Under the **Inbound rules for security groups**, click **Create a new security group** with a **Security group name** of `fragments-ecs-sg` and a **Security group description** of `fragments ECS access`. Now set the following values to allow any inbound `HTTP` connection on port `80`:

| Type | Protocol | Port range | Source   | Values          |
| ---- | -------- | ---------- | -------- | --------------- |
| HTTP | TCP      | 80         | Anywhere | 0.0.0.0/0, ::/0 |

Finally, the **Public IP** should be **Turned on** to auto-assign a public IP to your tasks.

#### 2.3.4 Load balancing

Because we are going to run our containers in one or more Fargate instances on a private network, we need to make it possible for external, public connections to access them. Previously we did this by directly accessing the public IP of our EC2 instance. However, with highly-scaled servers, we may want to run many identical copies of the same server. When we do this, we need a gateway to manage access to these different IPs.

A Load Balancer allows us to provide users with a single URL, but then direct traffic to any number of identical servers running our app. A similar thing happens when you make a request to `https://www.google.ca`, which is a gateway to the many thousands of servers running Google's search server.

1. Under **Load balancing**, choose `Application Load Balancer`. This load balancer will allow external network traffic to be properly routed from the default HTTP port `:80` to your container running on port `:80`.
2. We will **Create a new load balancer** and give it unique **Load balancer name**: `fragments-lb` (i.e., fragments load balancer).
3. We will **Create new listener** on **Port** `80` with **Protocol** `HTTP`. This will mean that our load balancer listens for public traffic on port `80` which is the default for production web applications.
4. Our container will be set to listen on port `80`, so we need to create a new **Target Group** where the load balancer will send traffic. Click **Create new target group** with the following values:

| Target group name | Protocol | Deregistration delay | Health check protocol | Health check path |
| ----------------- | -------- | -------------------- | --------------------- | ----------------- |
| fragments-tg      | HTTP     | 300                  | HTTP                  | /                 |

Once you are satisfied that you've configured the service correctly, scroll down and click the **Create** button, which will begin creating the following resources:

- An ECS Service
- A [CloudWatch Log Group](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/Working-with-log-groups-and-streams.html), which will allow us to access the aggregated logs of all our task/containers. It will be named after our Task definition (i.e., `/ecs/fragments-task`)
- A [VPC](https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html), which is a virtual private network for all of the resources running in the cluster
- Two [Subnets](https://docs.aws.amazon.com/vpc/latest/userguide/configure-subnets.html), which define IP ranges to use in two different Availability Zones (i.e., `us-east-2a` and `us-east-b`).
- A [Security Group](https://docs.aws.amazon.com/vpc/latest/userguide/VPC_SecurityGroups.html) to control access for the traffic moving in/out of the network (similar to what we did for our EC2 and ssh/http access in a previous lab).
- An [Application Load Balancer](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/introduction.html) to balance and manage access to our instance(s)
- A [CloudFormation Stack](https://aws.amazon.com/cloudformation/) used to generate/destroy all of this infrastructure. CloudFormation allows YAML based definitions of AWS cloud resources to be automatically deployed, upgraded, or destroyed.

It will take some time (minutes) to create all of these AWS resources. Once it completes, you should see your `fragments-service` listed with a **Status** of `Active`. The **Deployment and tasks** column will show you how many tasks are desired vs. running. In our case, that should be `1/1 Tasks running`, with a green indicator to show that the deployment was successful. If it was not successful, it will try to re-deploy, in case the error is fixable (e.g., a networking issue downloading your image); however, if the error is due to an incorrect configuration (e.g., missing environment variables), we will need to diagnose the problem. In either case, click on your `fragments-service` and find the **Logs** tab. Here you should see the logs produced by your server, which is useful for debugging.

Go back to your service (i.e., Amazon Elastic Container Service > Clusters > fragments-cluster > Services > fragments-service) and this time click the **View load balancer** button. This will take you to the **EC2 > Load balancers** console, and show your load balancer, along with its **DNS name**. For example: `fragments-alb-1358654432.us-east-2.elb.amazonaws.com`. You can load your service using the URL <http://fragments-alb-1358654432.us-east-2.elb.amazonaws.com>.

## 3. Managing ECS Resources via the Console

1. Under **Clusters** we now have a `fragments-cluster` with a single service, `fragments-service`. The console will show the **Status** of the service (i.e., **ACTIVE**) and how many **Pending** vs. **Running** tasks there are in the service (we should have 1).
2. Under the **Service Name** column, click the `fragments-service`.
3. In the **Status** pane, click the **View load balancer** button to open the **EC2 > Load balancers** console and your `fragments-lb` load balancer.
4. In the Load balancer console's **Details** pane, find your load balancer's [A Record](https://www.cloudflare.com/learning/dns/dns-records/dns-a-record/) **DNS name**. It will look something like `fragments-lb-938491946.us-east-2.elb.amazonaws.com`. This is our load balancer's DNS hostname, and the URL you would use to access it is `http://fragments-lb-938491946.us-east-2.elb.amazonaws.com`, which uses the default HTTP port `80`, and should direct traffic to your container on port `80` automatically.
5. Write down this URL, which is the `API_URL` value you'll need to use for your deployed microservice's environment variables and for accessing your production deployment in future labs and assignments.

## 4. Logs

You can access logs for your task(s) in a number of ways.

1. Using the AWS CLI, enter the following command: `aws logs tail /ecs/fragments-task --follow`. This will allow us to stream the logs to the terminal as we interact with our cluster. Try accessing your instance's health check route in your browser and wait to confirm that the logs appear. NOTE: it will take a few seconds for them to appear.
2. In the **ECS Console**, navigate to your `fragments-cluster`, then to your `fragments-service` and find the **Logs** tab. This will show you the same information.
3. You can also click the **View in CloudWatch** to open the CloudWatch console.

Each of these methods allows you to view, filter, and search through your logs for information about what is happening in your code. Any `logger.info()`, `logger.error()`, etc. messages that you log will show up here. If something isn't working in your server, use these logs to help diagnose what is failing.

## 5. Adding/Removing Tasks

Let's try changing the number of instances of our task that our `fragments-service` runs.

1. In the **ECS Console**, go back to your `fragments-cluster` and `fragments-service`. Click the **Update service** button. Change the **Desired tasks** to `2` instead of `1`, and then scroll down and click **Update**.
2. In the `fragments-service` console, click the **Tasks** tab. You should now see 2 tasks, one of which may take a minute to get provisioned and change to the **Running** status.
3. Once both tasks are **Running** go back to your load balancer's health check route and refresh it a few times. You should notice your `hostname` change as the two instances take turns responding to your requests. For example, you might see something like `"hostname":"ip-10-0-0-179.ec2.internal"` followed by `"hostname":"ip-10-0-1-190.ec2.internal"` as the load balancer sends you to one task's instance followed by the other.
4. When you're satisfied that both instances are working, edit your `fragments-service` again to reduce the count back down to `1`. We could set any number of tasks to scale our app, but `1` is all we need, given our current load.

> [!NOTE]
> It will take some time for the service to remove the extra task, while it ensures all connections are drained, and the resources destroyed. The load balancer will make sure the service is always available. You can monitor its progress in the **Events** tab, where you'll see messages like:
>
> - _(service fragments-service, taskSet ecs-svc/2899704474498630590) has begun draining connections on 1 tasks._
> - _service fragments-service has stopped 1 running tasks: task 38b054c4e6724fafbdc1fac589f8d0ae._
> - _service fragments-service has reached a steady state._

Reducing your infrastructure to only what is necessary will save you money, since running two instances will cost you twice the amount, and we're not expecting any load while in development.

**Before you go to the next step, make sure you only have a single instance (1) running.**

## 6. GitHub Actions Setup

So far we've been doing everything manually via the **AWS Console**. Now we'll switch gears and start to automate the process via our **GitHub Actions Continuous Delivery (CD)** workflow.

### 6.1. Adding the Task Definition JSON to our repo

Our first step is to move the fragments' **Task Definition's JSON** file into our `fragments` repo. We need to be able to send our cluster an updated definition every time we release a new version.

1. In the **ECS Console**, click on the **Task Definitions** menu item on the left
2. Find your `fragments-task` under the **Task Definition** list. Click it.
3. Next, pick the latest revision of the task (e.g., `fragments-task:1`, or `fragments-task:2`, etc.) and click it. You might only have a single revision.
4. Click the **JSON** tab. This is the JSON definition of our task.
5. Click the **Download JSON** button to download our task definition as a JSON file
6. Copy this file JSON file into the root of your `fragments` repo and name it `fragments-definition.json`.
7. Read through the file and locate the following keys: `"environment"` and `"image"`. We will be altering these later in our GitHub Actions Workflow. Pay attention to any information here that shouldn't be included in git/GitHub (e.g., secrets), especially within your environment variables. If there are any secrets, remove them and make a note that we need to add them back later via GitHub Encrypted Secrets.
8. Add and commit this file to git.

### 6.2 Continuous Delivery and AWS Deployment

Now we're ready to connect our **Continuous Delivery** workflow on **GitHub Actions** to our [Amazon ECS](https://aws.amazon.com/ecs/) cluster. Our goal is to have a `tag` in git trigger our ECS service to automatically deploy a new task definition and to run an updated Docker container, replacing the existing one(s).

Recall in [Lab 7](../../labs/lab-07/README.md) that we automatically built and pushed our Docker image to a private [Amazon Elastic Container Registry](https://aws.amazon.com/ecr/), using our server's current version (i.e., the git `tag`). The relevant portion of our workflow was this:

```yml
steps:
    - name: Configure AWS Credentials using Secrets
        uses: aws-actions/configure-aws-credentials@v6
        with:
        # Use our GitHub Encrypted Secrets via secrets.*
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        # Hard-code our region, which isn't a secret, and won't change
        aws-region: us-east-2

    # Login to our ECR repository using the configured credentials
    - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

    # Build and Push an Image to Amazon ECR
    - name: Build and push to Amazon ECR
        env:
        # Define an Environment Variable with our ECR Registry, getting
        # the value from the previous step's outputs
        ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
        # Define an Environment Variable with our ECR Repository Name
        ECR_REPO: fragments
        # We'll give this image two different tags. First, we'll use the git tag (vX.Y.Z)
        # so that we can always go back and re-create this setup again in the future
        # if we have to test or debug something. Second, we'll also replace the
        # `latest` tag, since this is our most up-to-date version.
        VERSION_TAG: ${{ github.ref_name }}
        uses: docker/build-push-action@v7
        with:
          push: true
          # Use the git tag version and `latest`
          tags: ${{ env.ECR_REGISTRY }}/${{ env.ECR_REPO }}:${{ env.VERSION_TAG }}, ${{ env.ECR_REGISTRY }}/${{ env.ECR_REPO }}:latest
```

Now we're going to add a few more `steps` after these in order to prepare and deploy our task to ECS.

Whenever we push a new tagged image to ECR, we'll need to update the `image` we use in our `fragments-definition.json` file. We could hand-edit this file, but luckily there's an existing GitHub Action we can use that will do it for us automatically, [aws-actions/amazon-ecs-render-task-definition](https://github.com/aws-actions/amazon-ecs-render-task-definition).

The [aws-actions/amazon-ecs-render-task-definition](https://github.com/aws-actions/amazon-ecs-render-task-definition) action lets us provide a new `image` to use. It also lets us (optionally) specify or update `environment-variables`. If you have any values you want to set, or secrets to include, you can do that here at the same time.

Make sure all necessary runtime environment variables are set so your server will start and operate properly (e.g., `AWS_REGION`, `AWS_COGNITO_POOL_ID`, `AWS_COGNITO_CLIENT_ID`, `API_URL`=_{your load balancer DNS URL}_, `FRAGMENTS_LOG_LEVEL`, etc). As we add more features to our microservice in the coming weeks, this list will need to expand (e.g., S3 bucket name, DynamoDB table name). At this stage of the course, you should be able to manage your own environment variables, so I'll leave it to you to sort out how you want to accomplish this.

1. Include a new **step** in your `.github/workflows/cd.yml` workflow to update the ECS task definition. Make sure the `task-definition`, and `container-name` match what you used in your ECS cluster, and that all `environment-variables` are defined, either in the `fragments-definition.json` file itself, or here:

```yaml
steps:
  ...

  # We need to update our fragment's Task Definition JSON
  # (i.e., fragments-definition.json) to use the newly
  # updated Docker Image to use (i.e., the tag we just pushed to ECR).
  # We can also update/set the environment variables if we want.
  - name: Fill in the new image ID in the Amazon ECS task definition
    id: update-task-def
    uses: aws-actions/amazon-ecs-render-task-definition@v1
    env:
      ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
      ECR_REPO: fragments
      VERSION_TAG: ${{ github.ref_name }}
    with:
      task-definition: fragments-definition.json
      container-name: fragments
      # Use the image we just built and pushed to ECR for this tag
      image: ${{ env.ECR_REGISTRY }}/${{ env.ECR_REPO }}:${{ env.VERSION_TAG }}
      # Add all the necessary environment variables, using GitHub Encrypted Secrets
      # for any values that should not be checked into git directly.  Here are
      # a few to get you started, but you should fill in the rest yourself.
      environment-variables: |
        FRAGMENTS_LOG_LEVEL=debug
        NODE_ENV=production
        # ...continue the rest here...
```

> [!IMPORTANT]
> Make sure that you set all of the necessary environment variables that are required at runtime (e.g., consider things like `AWS_S3_BUCKET_NAME`, `AWS_DYNAMODB_TABLE_NAME`, etc.)

We'll also need to use another existing GitHub Action to deploy our updated task definition to our ECS cluster: [aws-actions/amazon-ecs-deploy-task-definition](https://github.com/aws-actions/amazon-ecs-deploy-task-definition).

The [aws-actions/amazon-ecs-deploy-task-definition](https://github.com/aws-actions/amazon-ecs-deploy-task-definition) action registers our newly updated task definition with our ECS cluster, and asks our ECS service to schedule it for deployment (i.e., stop existing tasks and use the new definition to deploy new ones).

1. Include a new **step** in your `.github/workflows/cd.yml` workflow to deploy your ECS task definition. Make sure the `cluster` and `service` names match what you used in your ECS cluster. You can also request that GitHub Actions wait until the deployment is "stable" before finishing. NOTE: this will mean the **action runs for a long time**, since **deployment can take 5 to 10 minutes to complete** (shutdown old, provision new instances, pull image, start new, etc.):

```yml
steps:
  ...

  - name: Deploy Amazon ECS task definition
    uses: aws-actions/amazon-ecs-deploy-task-definition@v2
    with:
      task-definition: ${{ steps.update-task-def.outputs.task-definition }}
      cluster: fragments-cluster
      service: fragments-service
      wait-for-service-stability: true
```

## 7. Deployment via git Tag and AWS Console Management

We're ready to try and deploy our microservice directly from git through GitHub Actions to Amazon ECS!

1. You should `add`, `commit` and `push` your changes to GitHub. Make sure your `ci.yml` workflow passes. When it does, its time to tag a new release in git to test your updated `cd.yml` workflow:

```sh
# Make sure you've set your AWS Credentials
# in your GitHub Actions Secrets before doing this step
$ npm version patch
v0.7.2
$ git push origin main --tags
```

1. Now go to the **Actions** tab in your `fragments` GitHub Repo and watch the `cd.yml` workflow run. The new `steps` we added should look something like this when they run:

```sh
...

Run aws-actions/amazon-ecs-render-task-definition@v1
 with:
   task-definition: fragments-definition.json
   container-name: fragments-container
   image: ***.dkr.ecr.us-east-2.amazonaws.com/fragments:v0.7.2
 env:
   AWS_DEFAULT_REGION: us-east-2
   AWS_REGION: us-east-2

...

Run aws-actions/amazon-ecs-deploy-task-definition@v2
 with:
   task-definition: /home/runner/work/_temp/task-definition--2653-JPhhryJZbtSn-.json
   cluster: fragments-cluster
   service: fragments-service
   wait-for-service-stability: true
 env:
   AWS_DEFAULT_REGION: us-east-2
   AWS_REGION: us-east-2
```

1. Go back to your [Amazon ECS](https://aws.amazon.com/ecs/) console. As the deployment is taking place, you can watch your ECS service do the deployment. Click on your `fragments-service` and the **Deployments** tab. You'll notice two deployments in the table: one with a status of **Active** and the other **Primary**. The **Active** task is our current (i.e. old) task, which is in the process of being gracefully shutdown. You'll notice that under **Tasks** its **Desired** is `1` (we had wanted 1 of these tasks running), **Pending** is `0` (we want it stopped) and **Running** is `1` (it isn't **drained** and shutdown yet). The **Primary** deployment is the new task that we just created and is going to take over. Notice that the **Desired** is `1`, **Pending** is `1` (we want there to be `1`) and **Running** is `0` (it's not running yet). Eventually the **Active** task will become the **Primary** task, and we'll only have a single deployment listed.

2. In the [Amazon ECS](https://aws.amazon.com/ecs/) console you can also go to your your `fragments-service` and the **Events** tab. Here you'll see a chronological list of all events conducted by the service. This will include things like starting and stopping tasks. It's another good way to understand what's been happening with your cluster over time.

## 8. Interacting with your Service

Your `fragments` microservice should now be running on your ECS cluster. Try loading your load balancer's public URL again, and make sure your health check returns the expected version (i.e., whatever tag you created above when you ran `npm version`).

If your server will not respond, it's possible that it crashed on startup. To determine what's going on, we need to look at logs. Recall that you can do that by going to the **AWS Console** and searching for **CloudWatch**, then **Log groups** and finding your `/ecs/fragments-task` group.

See if you can understand what's happening with your service via the logs. If it's crashing and restarting, there may be a missing environment variable. If it's working properly, you should see HTTP requests being logged, including the ECS service querying the health check route on a regular basis (i.e., monitoring the container's health). If you can't figure out, ask for help.

Assuming you've made it this far, congratulations! You've successfully tested, built, and deployed your dockerized microservice from git to the cloud using a single git command! It's a lot of initial set-up, but now that you've done the hard work, deploying new versions is simple.

> [!NOTE]
> Be aware that after completing this walkthrough, your CloudLabs spending will increase more quickly than it used to. This is because we are using a lot more AWS resources, many of which do not fit in the Free Tier. That's OK, we have $50 credits to spend; but pay attention to your costs, and if you notice your spending increasing too quickly, or reaching the $50 budget, talk to your professor to see what's happening.

## 9. Next Step [optional]

If you're up for an additional challenge, now it's time to **secure** your service on AWS using a custom domain and SSL certificate. See the [My.Custom.Domain Walkthrough](./mycustomdomain-walkthrough.md), which will help lead you through the steps.
