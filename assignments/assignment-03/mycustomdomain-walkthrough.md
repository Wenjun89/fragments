# Custom Domains and SSL Certificates

In this optional walk-through, we'll learn how to create custom domains and SSL certificates for these domains. This will allow us to connect to our service over HTTPS.

Normally, creating custom domains requires a credit card; however, Seneca has created a tool to allow you to do this for free.

## My.Custom.Domain

The [My.Custom.Domain](https://mycustomdomain.senecapolytechnic.ca/) service is a web-based tool for Seneca students and faculty to be able to create and manage custom domains and SSL certificates. These domain names and certificates can then be used for projects, cloud resources, or other servers that need to be secured.

In order to secure network communications, services must use custom domain names via [DNS Records](https://www.cloudflare.com/learning/dns/dns-records/) as well as public key encryption via [SSL Certificates](https://www.cloudflare.com/learning/ssl/what-is-an-ssl-certificate/).

[My.Custom.Domain](https://mycustomdomain.senecapolytechnic.ca/) uses [AWS Route53](https://aws.amazon.com/route53/) to host DNS Records and [Let's Encrypt](https://letsencrypt.org/) as its Certificate Authority to create an SSL certificate.

The tool was created by students in the OSD700 and DPS911 open source courses at Seneca, and you can view the code at <https://github.com/DevelopingSpace/starchart>.

### 1. Authenticating

When you visit [My.Custom.Domain](https://mycustomdomain.senecapolytechnic.ca/), you'll be asked to **Sign In**. To sign in, use your Seneca account.

**NOTE**: in order to access the service, your Seneca account must first be granted permissions. If you are not able to log in, please speak to your professor, who can get it enabled by Seneca ITS if necessary.

Once signed in, you can create/manage DNS Records or SSL Certificates.

### 2. Creating a Custom Domain

To create a custom DNS Record, click **Create DNS Records**. You can now manage existing records, or click **Create new DNS Record** to make a new one.

You are able to create custom domains of the form:

```text
{project-name}.{your-username}.mystudentproject.ca
```

For example, if your Seneca login username is jsmith, you can create a domain like `fragments.jsmith.mystudentproject.ca`. The `.jsmith.mystudentproject.ca` suffix is pre-determined for each user (you can't change it); but the prefix can be anything you like (NOTE: DNS Record Names can contain lowercase letters (`a-z`), numbers (`0-9`), and `-` or `_` only`).

Each DNS Record has a **Type**, which differs depending on the information you wish to store. For example, an IPv4 Address uses an **A Record** type, and a Domain Name uses a **CNAME Record**.

If you are creating a custom name for your AWS Load Balancer, you want to use a **CNAME**. For example, if your Load Balancer URL is:

<http://fragments-lb-928481946.us-east-2.elb.amazonaws.com/>

Your URL contains the following:

- **protocol**: `http:`
- **hostname**: `fragments-lb-928481946.us-east-2.elb.amazonaws.com`
- **port**: `80`
- **pathname**: `/`

If our goal is to create a custom domain for the existing `fragments-lb-928481946.us-east-2.elb.amazonaws.com` domain, we need to create a **CNAME** record with `fragments-lb-928481946.us-east-2.elb.amazonaws.com` as its value.

For example, you could create a new **CNAME** record with:

- **Name**: `fragments` (i.e., the full name would be `fragments.{your-username}.mystudentproject.ca`)
- **Type**: `CNAME Record (Domain Name)`
- **Value**: `fragments-lb-928481946.us-east-2.elb.amazonaws.com`

You can also fill in other information information like the port(s) you are using, the course, description of what you are using this for, etc. This information is not necessary for the DNS Record, but is included for documentation purposes only.

After you click **Create**, it will **take some time for your DNS Record to get created and fully propagated on DNS servers around the world** (DNS is a global, distributed database).

Once it is created and fully replicated world-wide, you should be able to use either `fragments-lb-928481946.us-east-2.elb.amazonaws.com` or `fragments-{your-username}.mystudentproject.ca` to reach your server (i.e., both point to the same thing).

### 3. Creating a SSL Certificate

> [!WARNING]
> **Do NOT create an AWS Private Certificate Authority (CA)**
>
> When setting up your SSL certificate, you must use the certificate provided by **My.Custom.Domain** (powered by Let's Encrypt). Do **not** navigate to AWS Certificate Manager and create a new **Private Certificate Authority** — this is a paid service that begins incurring charges immediately and will quickly exhaust or exceed your AWS credits, potentially locking your account.
>
> The correct workflow is:
>
> 1. Request your certificate through **My.Custom.Domain** (described below)
> 2. Then **import** it into ACM as described in Section 4
>
> Do **not** use the "Request a certificate" option inside ACM directly, and do **not** export wildcard certificates (e.g. `*.domain.com`) from ACM — both can result in unexpected charges.

Once you have created one or more DNS Records, you can now create an SSL Certificate to secure those domains. On the main page, click **Manage Certificate**.

Here you are able to **Request** an SSL Certificate for any domains you create at `*.{your-username}.mystudentproject.ca`. The process of creating and validating your certificate is complex and takes some time. When your certificate is ready, you will receive an email and the web app will allow you to access it.

### 4. Importing your SSL Certificate into AWS

> [!NOTE]
> The steps below import the certificate you obtained from **My.Custom.Domain** in the previous step. Make sure you are using the **Import a certificate** option — not "Request a certificate" — to avoid any charges.

There are various ways to use your SSL Certificate. Instructions are provided for using your certificate in various settings, including [importing it into the AWS Console](https://docs.aws.amazon.com/acm/latest/userguide/import-certificate-api-cli.html) for use with AWS services, like your Load Balancer, your Cognito Login page, etc.

1. In the AWS Console, go to the **AWS Certificate Manager (ACM)** console
2. Click the **Import a certificate** button
3. You will need to copy/paste the Certificate's body, private key, and chain from My.Custom.Domain into the textboxes in ACM.
4. Click **Next**
5. You can optionally add a **Tag**, then click **Next** again
6. Click **Import** to complete the process

### 5. Using your SSL Certificate with ECS

Now that we've created a custom DNS, and created and imported an SSL Certificate, we can use it with our ECS Load Balancer to provide a secure HTTPS connection our our `fragments` server.

1. In the AWS Console, go to the **Elastic Container Service (ECS)** console
2. Click on your `fragments-cluster`
3. Click on your `fragments-service`
4. Click the **View load balancer** button to navigate to the **EC2 Load Balancer** console and your `fragments-lb` load balancer settings
5. Under **Listeners and rules**, click **Add listener**
6. Under **Protocol** choose `HTTPS` and the default HTTPS port, `443`
7. For **Routing actions** we will **Forward to target groups**, and under **Target group** must choose our existing `fragments-tg` target group
8. Under **Secure listener settings**, select the **Certificate source** as **From ACM** and choose the **Certificate (from ACM)** that you created in the previous step (i.e., `*.{your-username}.mystudentproject.ca`)
9. Scroll down and click **Add**

### 6. Update the Security Group for HTTPS Traffic

Our listener is configured, however, it will have an error: **Not reachable**. We need to update our **Security Group** to allow traffic to come in on port `443`.

1. In the `fragments-lb` console, click the **Security** tab
2. Locate your `fragments-ecs-sg` security group and click it
3. In the **Inbound rules** click the **Edit inbound rules**
4. Click **Add Rule** to create two new rules and use the following values:

| Type  | Protocol | Port range | Source        | Values    |
| ----- | -------- | ---------- | ------------- | --------- |
| HTTPS | TCP      | 443        | Anywhere-IPv4 | 0.0.0.0/0 |
| HTTPS | TCP      | 443        | Anywhere-IPv6 | ::/0      |

### 7. Update the HTTP Listener to Redirect to HTTPS

In secure web applications, it is common practice to "upgrade" in-secure HTTP connections to HTTPS by automatically redirecting them. We can do this by updating our load balancer's `HTTP:80` listener:

1. In the `fragments-lb` console, click the **Listeners and rules** tab
2. Click the `HTTP:80` listener
3. Under **Rules** select the **Default** rule, which is currently configured to forward traffic to our target group
4. In the top-right corner, click the **Action** button, then **Edit rule**
5. Under **Routing actions**, modify the configuration to **Redirect to URL** and then update **URI Parts** for the **Protocol** `HTTPS` to use **Port** `443`
6. For HTTP status code, use `301 - Permanently moved`, which will tell clients to use the HTTPS URL the next time.
7. Click **Save changes**

Now you can try accessing your custom DNS using both `http://` and `https://` addresses. A request to <http://fragments.{your-username}.mystudentproject.ca> should return a 301 (test it with `curl`) to redirect to `https://fragments.{your-username}.mystudentproject.ca`, which should show your healthcheck.

Once you have properly created, imported, and set up your SSL certificate in AWS, you should be able to update your `API_URL` environment variable to use the secure `https://fragments.{your-username}.mystudentproject.ca` URL.

Congratulations, you have now secured your server!
