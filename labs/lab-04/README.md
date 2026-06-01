# Lab 4

This lab will introduce you to one of the oldest and most important AWS services, [Elastic Compute Cloud (EC2)](https://aws.amazon.com/ec2/).

EC2 allows you to provision and run on-demand compute instances (i.e., virtual machines, or VMs) in Amazon's cloud using pre-configured [Amazon Machine Images (AMIs)](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/AMIs.html). EC2 instance types let you choose the specific amount of CPU, RAM, storage, network, etc. that you need for a given compute task--there are [nearly 500 instance types](https://aws.amazon.com/ec2/instance-types/) to choose from!

EC2 instances are generally [billed by the second](https://aws.amazon.com/ec2/pricing/) (i.e., you pay for what you use), and [Amazon's Free Tier includes 750 hours of Linux and Windows](https://aws.amazon.com/ec2/pricing/?loc=ft#Free_tier). The CloudLabs environment is further limited tu using one of the `T2`, `T3`, or `T3a` instance types, and the `.nano`, `.micro` or `.small` sizes. Different instance types have different rates (e.g., an instance with a Terabyte of RAM costs more than one with 1 GiB). You can run an instance for a few minutes (e.g., CI job), hours (e.g., cloud development environment), or for years at a time (e.g., server) depending on your needs.

## Launch an EC2 Instance via the AWS Console

1. Login into the **AWS Console** via your CloudLabs sign-in link.

2. Search for **EC2** in the list of AWS services

3. Look at the **AWS Region** you are using. Amazon EC2 is hosted around the world in various [**Regions**](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html#concepts-regions). At the top of the **EC2 Dashboard**, in the menu bar, you'll see a drop-down with the current AWS region name, for example: **N. Virginia** or **Ohio** or **London**. We want to launch our EC2 instance in the **us-east-2** region, which is run out of **Ohio**. This should be the default. The [region you choose matters](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html), so pay attention to it.

4. Create a new EC2 Instance by clicking the **Launch instance** menu and **Launch instance** menu item.

### Configuring an EC2 Instance

You will now begin a multi-step process to configure and create your instance.

1. **Step 1: Choose a Name** your EC2 cloud instance needs a name, which is used for informational purposes only. You can name your EC2 instance whatever you like, for example: **Lab 4**.

2. **Step 2: Choose an Amazon Machine Image (AMI)**: next, you need to pick your machine image, which is a pre-built disk image that includes an operating system. Amazon has many to choose from, but your AWS account only supports a few of these. We'll use [**Amazon Linux 2023 AMI**](https://aws.amazon.com/linux/amazon-linux-2023/) running on **64-bit x86**. This will give us a 64-bit Intel-based Linux Server running [CentOS](https://www.centos.org/), which is optimized and pre-configured to run on EC2.

3. **Step 3: Choose an Instance Type**: next, you need to pick your virtual hardware specs, including number of virtual CPUs, amount of RAM, storage, and network performance. Depending on what your compute job requires, you need to pick hardware resources to match (e.g., lots of CPUs for parallel jobs, lots of RAM for working with big data, etc). Each instance type has a name, and we'll use a general purpose instance type called [t3.micro](https://aws.amazon.com/ec2/instance-types/t3/) (or [t2.micro](https://aws.amazon.com/ec2/instance-types/t2/) depending on the region). It has 2 vCPU, 1 GiB RAM, and is available as part of the **Amazon Free Tier**. NOTE: we are running a node.js microservice, and node.js is a single process that typically uses less than 1 GiB of RAM. Therefore, a t2.micro instance is perfect for our use case.

4. **Step 4: Create a Key Pair**: next, we need to create an **SSH Key Pair** so that we can access our instance once it boots. This step requires some explanation

#### Key Pairs

When our EC2 instance is started, it's going to be running in a data centre somewhere in North Virginia that we can't physically access. We're going to have to access it via SSH over the network. Before it gets booted for the first time, Amazon will set up [SSH Public Key Authentication](https://www.ssh.com/academy/ssh/public-key-authentication) for us on the instance. Instead of creating and sending us a username and password, Amazon will create a [Key Pair](https://www.ssh.com/academy/ssh/public-key-authentication#key-pair---public-and-private), consisting of a [Public Key](https://www.ssh.com/academy/cryptography/public-key) and a [Private Key](https://www.ssh.com/academy/cryptography/private-key).

The **public key** will be installed on the EC2 instance by Amazon, and used to **encrypt** all data that is sent from the instance. This data can only be **decrypted** using the **private key**. The private key will be held by us (no one else will have it, including Amazon). The fact that we hold the private key is enough to prove that we are who we say we are (i.e., we can either decrypt the data or we can't). The fact that we hold the private key will mean that we don't need a username and password to login.

This is a common cloud security setup, and many network services use SSH key pairs to secure access to remote resources (e.g., [GitHub is another example](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)).

Let's create your key pair:

1. Click **Create new key pair**.

2. In the **Create key pair** dialog that appears, enter a **Key pair name**, for example: **ccp555-key-pair** or **dps955-key-pair**, since you can reuse this key pair for other labs and assignments during this course.

3. The **Key pair type** can be **RSA**, which is universally supported by SSH clients, or the newer **ED25519**, which provides some optimizations on the key size, but is not as well supported. Either will work, but you can use the default key pair type.

4. For **Private key file format**, you need to pick the type based on your SSH client. If you are on Windows and use PuTTY to SSH, you need to choose [`.ppk` file](https://stackoverflow.com/questions/20367694/whats-the-difference-between-ppk-and-pem-where-pem-is-stored-in-amazons-ec2/20369384). However, if you are using OpenSSH (e.g., the `ssh` command) on macOS, Linux, or WSL2, you need to choose [`.pem` file](https://www.lifewire.com/pem-file-4147928). A key looks like this, and is an encoded version of a binary key (e.g., here's a `.pem` formatted key):

```pem
-----BEGIN PRIVATE KEY-----
MIICdgIBADANBgkqhkiG9w0BAQEFAASCAmAwggJcAgEAAoGBAMLgD0kAKDb5cFyP
jbwNfR5CtewdXC+kMXAWD8DLxiTTvhMW7qVnlwOm36mZlszHKvsRf05lT4pegiFM
9z2j1OlaN+ci/X7NU22TNN6crYSiN77FjYJP464j876ndSxyD+rzys386T+1r1aZ
aggEdkj1TsSsv1zWIYKlPIjlvhuxAgMBAAECgYA0aH+T2Vf3WOPv8KdkcJg6gCRe
yJKXOWgWRcicx/CUzOEsTxmFIDPLxqAWA3k7v0B+3vjGw5Y9lycV/5XqXNoQI14j
y09iNsumds13u5AKkGdTJnZhQ7UKdoVHfuP44ZdOv/rJ5/VD6F4zWywpe90pcbK+
AWDVtusgGQBSieEl1QJBAOyVrUG5l2234raSDfm/DYyXlIthQO/A3/LngDW
5/ydGxVsT7lAVOgCsoT+0L4efTh90PjzW8LPQrPBWVMCQQDS3h/FtYYd5lfz+FNL
9CEe1F1w9l8P749uNUD0g317zv1tatIqVCsQWHfVHNdVvfQ+vSFw38OORO00Xqs9
1GJrAkBkoXXEkxCZoy4PteheO/8IWWLGGr6L7di6MzFl1lIqwT6D8L9oaV2vynFT
DnKop0pa09Unhjyw57KMNmSE2SUJAkEArloTEzpgRmCq4IK2/NpCeGdHS5uqRlbh
1VIa/xGps7EWQl5Mn8swQDel/YP3WGHTjfx7pgSegQfkyaRtGpZ9OQJAa9Vumj8m
JAAtI0Bnga8hgQx7BhTQY4CadDxyiRGOGYhwUzYVCqkb2sbVRH9HnwUaJT7cWBY3
RnJdHOMXWem7/w==
-----END PRIVATE KEY-----
```

5. Click **Create key pair**, which will return you to the EC2 Wizard, and also download your `.pem` or `.ppk` private key file. Make sure you **don't lose this file**! People often store their ssh key files in an `.ssh/` directory in their home directory. Wherever you store it, you will need it **every** time you want to connect to your instance over ssh.

5. **Step 5: Network settings**: now we need to configure our network and security settings. Click the **Edit** button to make changes to the default configuration. By default, AWS will create a [Virtual Private Cloud](https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html) (i.e., a private network) and subnet to host our instance, and we will be assigned a public IP address. However, we need to modify the **Security Group**

#### Security Groups

A [Security Group](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-security-groups.html?icmpid=docs_ec2_console) is a virtual firewall for your EC2 instance, used to control inbound and outbound network traffic.

A security group defines rules that allow traffic to come into, or go out of your instance. If you define no rules, nothing will be able to connect, making your instance completely secure, but also completely inaccessible!

We will create a new security group to define custom access rules for our instance. Later, we can re-use this security group in other instances.

1. **Step 6: Create security group**. Choose **Create security group**.

Next, configure the security group's rules. The first rule is already defined for us, and allows **SSH** connections. We'll be working with our instance remotely over the network via `ssh`. When you `ssh` into your EC2 instance, you'll create a **TCP** connection to **port 22** on your EC2 instance; therefore, we need to open port `22` on our instance.

We also need to specify who is allowed to connect to port 22. By default **any** IP address on the internet is allowed to connect to the instance: that's what the [CIDR notation](https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing#CIDR_notation) `0.0.0.0/0` means. So using `0.0.0.0/0`, your home computer can connect to your EC2 instance over SSH, but so too can a hacker from a computer on the other side of the world. If your home network uses a [Static IP vs. a Dynamic IP](https://support.google.com/fiber/answer/3547208?hl=en), you could also select the **My IP** option under the **Source type** dropdown. This will write your current IP in CIDR notation for you. If you're not sure, leave it open to the world, so you don't get locked out. Under **Description** enter **SSH access for administration**.

Next, click **Add security group rule** to create a second rule. This time we'll add a rule to allow our microservice's node.js server. Under the **Type** dropdown, choose **Custom TCP**. We're running our server on port `8080`, so update the **Port range** to `8080` (NOTE: [running on ports below `1024` often requires `root` privileges](https://www.w3.org/Daemon/User/Installation/PrivilegedPorts.html)). Choose **Anywhere** under **Source type** (i.e., we'll use `0.0.0.0/0` for any [IPv4](https://serverfault.com/questions/698369/what-is-the-ipv6-equivalent-of-0-0-0-0-0)). In the **Description** enter **node.js microservice access**.

1. **Step 7: Configure storage**: next, you can configure the amount and type of storage to attach to your instance. Our microservice won't store data in the EC2 instance's filesystem, so we don't need more storage than the default (8 GiB).

2. **Step 8: Advanced details**: expand the **Advanced details** options, and make one change. We need to set AWS account permissions for our EC2 instance. Under **IAM instance profile**, choose **LabInstanceProfile**.

An [**IAM Role**](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/iam-roles-for-amazon-ec2.html) is used to grant permissions to applications so that they can access other associated AWS resources (e.g., calling an API from an EC2 instance), without having to share usernames, passwords, or other credentials. Your CloudLabs account already defines the **LabInstanceProfile IAM role** for you. It will help you connect resources you create within the lab environment.

> [!NOTE] > [Working with IAM roles directly](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/security-iam.html) is _not_ supported in your account, so we won't spend time looking at how to do it. However, this is an important topic to look into when working with AWS outside of CloudLabs.

1. **Step 9: Summary** finally we are ready to launch our instance. We need to pick the number of instances to start. You could, for example, run more than 1 instance (e.g., if you wanted to start a cluster of many identical machines). In this case, we'll only use 1 instance.

2. Click **Launch instance**. Once your instance has been successfully launched, click the **View all instances** button.

## Connecting to an Instance

In the **AWS Management Console**, in the **EC2 service**, choose **Instances**. Find your running instance in the list of instances (you'll only have 1). Click the checkbox next to the instance so you can see its **Details**.

At the bottom of the screen, in the **Details** tab, take note of the following:

- **Public IPv4 address** - the public IP address of the instance
- **Public IPv4 DNS** - the public DNS of the instance

Take a screenshot of this window and your instance details.

Once your instance has booted, you can [connect to it using SSH](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/AccessingInstances.html?icmpid=docs_ec2_console). Depending on which operating system you are using, you will need to install and configure the appropriate SSH client:

- On Windows you can use [PuTTY](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/connect-linux-inst-from-windows.html) or a command-line [ssh client](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/AccessingInstancesLinux.html). NOTE: you **must** use PuTTY **v0.78** or later in order to be compatible with the Amazon Linux security protocols.
- On Linux or macOS, you can use the system's [ssh client](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/AccessingInstancesLinux.html)

Follow the steps below for your operating system in order to connect to your instance.

### Windows Users: Using PuTTY to Connect

Windows users will usually use [PuTTY](https://www.ssh.com/academy/ssh/putty) to SSH into Amazon EC2 instances. If you do not have PuTTY installed on your computer, [download and install it now](https://www.ssh.com/academy/ssh/putty/windows/install)

> [!IMPORTANT]
> These instructions are specific to PuTTY v0.78, and the UI may have changed slightly. See the [AWS PuTTY docs](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/putty.html) as well.

- Open `putty.exe`
- Configure PuTTY to not timeout:
  - Choose **Connection**
  - Set **Seconds between keepalives** to `30`, allowing you to keep the PuTTY session open for a longer period of time.
- Configure your PuTTY session via the **Category** pane:
  - Choose **Session**
    - **Host Name (or IP address):** Copy and paste the IPv4 Public IP address for the instance.
  - Under the **Connection** list, expand **SSH**, then expand **Auth** (in previous PuTTY versions, click **Auth** vs. expanding)
    - Choose **Credentials**
    - Beside **Private key file for authentication** choose **Browse...**
    - Browse to and select the `.ppk` file that you downloaded with your SSH key pair
    - Choose **Open** to select it
    - Choose **Open**
- Choose **Yes**, to trust the host and connect to it.
- When prompted **login as**, enter the default EC2 username: **ec2-user**

### macOS and Linux Users - Using SSH to Connect

Users on macOS or Linux should use the built-in `ssh` command-line client.

- Open a terminal
- Locate your `.pem` file that you downloaded earlier with your SSH key pair (the instructions below assume that it's called `ccp555-key-pair.pem` or `dps555-key-pair.pem`, but use whatever you named it)
- Change the permissions on the file to be **read only** using the [`chmod` command](https://en.wikipedia.org/wiki/Chmod):

```sh
chmod 400 ccp555-key-pair.pem
```

- Run the following `ssh` command, replacing `{filename}` with the path/filename to your `.pem` file, and `{public-dns}` with the actual public IPv4 DNS for your instance:

```sh
ssh -i {filename}.pem ec2-user@{public-dns}
```

For example, assuming your private key was stored in `~/.ssh/ccp555-key-pair.pem` and your instance's DNS was `ec2-3-16-456-301.compute-1.amazonaws.com`, you'd type:

```sh
ssh -i ~/.ssh/ccp555-key-pair.pem ec2-user@ec2-3-16-456-301.compute-1.amazonaws.com
```

- Type `yes` when prompted to allow a first connection to this remote SSH server. Because you are using a key pair for authentication, you will not be prompted for a password.

## Using Amazon Linux 2023

You will now be connected and authenticated to your instance. It should look something like this:

```sh
   ,     #_
   ~\_  ####_        Amazon Linux 2023
  ~~  \_#####\
  ~~     \###|
  ~~       \#/ ___   https://aws.amazon.com/linux/amazon-linux-2023
   ~~       V~' '->
    ~~~         /
      ~~._.   _/
         _/ _/
       _/m/'
Last login: Thu Mar 16 17:22:08 2023 from 206.174.190.116
[ec2-user@ip-172-31-57-167 ~]$
```

Try running some commands to get familiar with the environment:

1. Check which user you are, using the [`whoami` command](https://en.wikipedia.org/wiki/Whoami):

```sh
$ whoami
ec2-user
```

1. Check which directory you are in, using the [`pwd` command](https://en.wikipedia.org/wiki/Pwd):

```sh
$ pwd
/home/ec2-user
```

1. Check what your IP address is (yours will obviously be different):

```sh
$ curl http://checkip.amazonaws.com/
3.95.200.72
```

1. Update your operating system's packages. We installed a pre-built AMI with Linux, CentOS, and other packages already installed. However, these need to be kept up-to-date, especially for security updates. Amazon uses a [Shared Responsibility Model](https://aws.amazon.com/compliance/shared-responsibility-model/) with its cloud instances, where security is partly up to Amazon (physical infrastructure), and partly up to you (OS, software). It's a good idea to always [update your OS to get the latest security fixes](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/install-updates.html), and keep it updated. In CentOS, we do that using the [`yum` command](https://access.redhat.com/sites/default/files/attachments/rh_yum_cheatsheet_1214_jcs_print-1.pdf) along with the [`sudo` command](https://en.wikipedia.org/wiki/Sudo), since this affects system setup (i.e., you need elevated rights):

```sh
$ sudo yum update
...
Install   1 Package  (+1 Dependent package)
Upgrade  16 Packages

Total download size: 53 M
Is this ok [y/d/N]:
```

Review the list of updates and type `y` and press `Enter` to continue, updating all of the packages. NOTE: you can also use `sudo yum update -y` to automatically answer 'y' to the installation (useful in scripts).

### Installing Packages

Your instance includes the OS as well as some standard Unix tools and libraries. In order to do anything beyond the basics, you'll need to install various software packages. For example, a text editor. The [nano](https://www.nano-editor.org/dist/v2.2/nano.html) and [vim](https://www.vim.org/) text editors are already installed. You can confirm that by using the [`which` command](<https://en.wikipedia.org/wiki/Which_(command)#:~:text=In%20computing%2C%20which%20is%20a,FreeDOS%20and%20for%20Microsoft%20Windows.>): `which vim` or `which nano` will show you the location of the binary

If you wanted to install a different editor, for example `emacs`, you'd do it like this:

```sh
sudo yum install emacs -y
```

Before proceeding, make sure you have a command-line text editor installed that you know how to use. If you're not sure, prefer `nano`.

1. Try installing `git`:

```sh
$ sudo yum install git -y
...
$ git --version
git version 2.32.0
```

1. Install **node.js** using the [Node Version Manager (`nvm`)](https://github.com/nvm-sh/nvm). We'll employ a common installation method based on `curl`, which will download a shell script, named `install.sh`, and pipe it to `bash`, which will run it:

```sh
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
```

After you run this command, you need to `exit` your session and **reconnect via ssh**, in order to restart your shell. When you do, you should be able to run `nvm` commands. For example, we can install the current [LTS version of node](https://github.com/nvm-sh/nvm#long-term-support) (`18.x` at the time of writing, but yours may be newer):

```sh
$ nvm install --lts
Downloading and installing node v18.13.0...
Downloading https://nodejs.org/dist/v18.13.0/node-v18.13.0-linux-x64.tar.xz...
######################################################################### 100.0%
Computing checksum with sha256sum
Checksums matched!
Now using node v18.13.0
Creating default alias: default -> 18 (-> v18.13.0)
```

You can install other versions the same way:

```sh
$ nvm install 16
Downloading and installing node v16.19.0...
Downloading https://nodejs.org/dist/v16.19.0/node-v16.19.0-darwin-arm64.tar.xz...
################################################################################# 100.0%
Computing checksum with shasum -a 256
Checksums matched!
Now using node v16.19.0 (npm v8.19.3)

$ node --version
v16.19.0
```

And then switch back and forth between those versions:

```sh
$ nvm use --lts
Now using node v18.13.0
$ nvm use 16
Now using node v16.19.0
```

### Install and Run the fragments Microservice on EC2

Our main task has been to install and run our `fragments` microservice on our EC2 instance. Before we can do that, we have to package and copy our source code to the instance.

1. Create a [`tarball`](https://wiki.debian.org/TarBall) of your project's source code. A tarball is similar to a `.zip` file, but is commonly used to create archives of source code trees (i.e., create a single file from a tree of files and folders). These archives are then compressed using `gzip` or other formats, giving `.tgz` files (i.e., gzip compressed tar file), also sometimes written `tar.gz`.

There are various ways to do this, but the easiest for node.js developers is to use the [`npm pack`](https://docs.npmjs.com/cli/v7/commands/npm-pack) command. From within your fragments microservice repo on your local machine, run `npm pack`:

```sh
$ cd fragments
$ npm pack
...
fragments-0.0.1.tgz
```

You will now have a tarball of your project's source code, excluding things like `node_modules/`, named `fragments-0.0.1.tgz` (the `0.0.1` is the current `version`, which might be different for you).

NOTE: we don't want to include the `node_modules/` folder when we create a tarball, or distribute our source code: first, the `node_modules/` folder is often massive; second, it can contain platform-specific code and binaries. When you run `npm install` or `npm ci`, the resulting `node_modules/` folder is specific to the OS on which you ran the command. If you move to another OS (Windows to CentOS Linux, for example), you need to re-install. Therefore, it's easier to always run `npm install/npm ci` instead of trying to move `node_modules/` between machines. This is also why we typically avoid putting `node_modules/` in git.

1. Copy your `fragments-0.0.1.tgz` tarball to your EC2 instance. We can use SSH to perform this network copy. The method you use to do it will differ, depending on your operating system and SSH client.

First, some background on the SSH Secure Copy (`scp` or `pscp` for short) command. It works in a similar way to the [`cp` command](<https://en.wikipedia.org/wiki/Cp_(Unix)>). We specify a `source` (what to copy) and a `destination` (where to copy it), and the file is copied. The `cp` command works within a filesystem on the local computer. For example, copy `original.txt` to `../new/location/original.txt`:

```sh
cp original.txt ../new/location/original.txt
```

We could have omitted the destination name as well, indicating we'd like to use the same filename as the source:

```sh
cp original.txt ../new/location
```

The [`scp` command](<https://en.wikipedia.org/wiki/Secure_copy_protocol#Secure_Copy_(remote_file_copy_program)>) is similar, but works between the filesystems of two machines across the network.

With `scp`, our `source` and `destination` are made up of both a `host` and `path` separated by the `:` character. For example: `remote-computer.com:file.txt` means `file.txt` in the home directory of the user at `remote-computer.com`.

We could also specify an absolute path: `remote-computer.com:/docs/file.txt`. Here we mean `/docs/file.txt` on the machine `remote-computer.com`.

If we omit the `host:` part, it means the file is (or belongs) on the local computer.

Consider a few examples. First, copy `file.txt` on the local computer to the remote computer, and put it in the home directory as `file.txt`:

```sh
scp file.txt remote-computer.com:file.txt
```

Here's the same thing with the destination filename left out (i.e., use the same name on the remote machine). Notice the trailing `:`:

```sh
scp file.txt remote-computer.com:
```

Or we could go in the other direction:

```sh
scp remote-computer:/data/info.json .
```

This will copy `/data/info.json` from the remote computer to the local computer, and put it at `./info.json`.

Now it's your turn. Using what you learned above, copy the `fragments-0.0.1.tgz` tarball to your EC2 instance. Here are some links and tips to help you:

- On Windows, use the [PuTTY Secure Copy](https://documentation.help/PuTTY/pscp.html) client, `pscp.exe`. You will need to make sure it is in your `PATH`, that you pass the `-i key` flag, and point to your `.ppk` key file, and that you use the correct IPv4 DNS for your instance. For example:

```sh
pscp -i ccp555-key-pair.ppk fragments-0.0.1.tgz ec2-user@ec2-3-16-456-301.compute-1.amazonaws.com:
```

> [!TIP]
> Some students running Windows and `pscp` have found that they also need to [explicitly add the `-P 22` flag](https://stackoverflow.com/questions/62817854/ssh-init-network-error-cannot-assign-requested-address) in order to have it connect to port 22 on the EC2 instance.

- Similarly, on Linux or macOS, use the `scp` command like we used `pscp` above:

```sh
scp -i ccp555-key-pair.pem fragments-0.0.1.tgz ec2-user@ec2-3-16-456-301.compute-1.amazonaws.com:
```

1. On your EC2 instance, navigate to your home directory and confirm that your tarball is there:

```sh
$ cd ~
$ ls
fragments-0.0.1.tgz
```

1. Extract your project's source code from your tarball. We do this with the [`tar` command](https://linuxhint.com/linux-tar-command/), and pass it a number of flags: `x` (extract), `v` (be verbose and print details about what's happening), `z` (use gzip to decompress), and `f` (specify a file):

```sh
$ tar -xvzf fragments-0.0.1.tgz
...
$ ls
fragments-0.0.1.tgz  package
$ mv package fragments
$ cd fragments
$ ls
env.jest  jest.config.js  package.json  README.md  src  tests
```

1. Install your project's dependencies using `npm install`.

2. Our microservice needs an `.env` file with the appropriate environment variables set. We don't put this in git, so we have to create one now. You have two options: 1) you can use a command-line text editor to write it manually; or 2) use `scp` or `pscp` to copy the `.env` file from your local computer to the remote machine (i.e., to `:fragments/.env`). Try doing 2) first, to make sure you know how, then open the file using 1) and make sure it's correct.

3. Run your server using `npm start`

4. Try accessing your microservice running on your EC2 instance in several ways

- Using your web browser. In the address bar, put the IPv4 DNS of your EC2 instance along with `:8080` for the port number (i.e., our server is running on port 8080). Take a screenshot showing the result of the health check route (i.e., `/`), and also the URL in the address bar, showing your EC2 instance's URL.
- Using `curl` on your local machine. Do the same thing you did in your browser, but use `curl` in the terminal. Take a screenshot.
- Connect a second terminal to your EC2 instance (i.e., ssh into your EC2 instance a second time, while your server is running in the other terminal), and use `curl` to connect to your microservice running on `localhost`. Take a screenshot.

## Configuring the AWS CLI

In the final part of this lab, you will control your EC2 instance using the command line on your local computer instead of the AWS web browser. To do this, you must install and configure the **AWS CLI** with the credentials provided by CloudLabs.

1. **Install the AWS CLI**: If you haven't already, download and install the
   AWS CLI for your operating system: [Install AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html).
   Verify it is installed by running:

```sh
aws --version
```

1. **Get your CloudLabs Credentials**:
   - Go to your CloudLabs portal page (where you clicked "Start Lab").
   - Look for the **Access Key Details** button
   - You need two specific values: the **Access Key** and the **Secret Key**. Keep this window open.

2. **Configure the CLI**:
   - Open your terminal (PowerShell, Command Prompt, or Terminal).
   - Run the configuration command:

```sh
aws configure
```

- **AWS Access Key ID**: Copy and paste the Access Key from CloudLabs.
- **AWS Secret Access Key**: Copy and paste the Secret Key from CloudLabs.
- **Default region name**: Enter the region code where you created your
  instance (e.g., `us-east-2` for Ohio).
- **Default output format**: Enter `json`.

1. **Verify Access**: Run the following command to ensure your credentials are
   working. It should return your User ID and Account number:

```sh
aws sts get-caller-identity
```

## Starting and Stopping your EC2 Instance

Because we are paying for every minute we run our EC2 instances, it's **important to shut them down when not in use**, otherwise your **AWS bill will increase until you stop them, even if they aren't doing anything**. It doesn't matter if you forget, AWS will still charge you.

> [!IMPORTANT]
> You are responsible for stopping EC2 instances when not in use. You will not be given more credits if you spend them all by accident.

1. **Stop via Console**: Select your instance in the AWS Console, and then click the **Instance state** dropdown menu. Choose **Stop instance**. Confirm that you want to **Stop** the instance.

2. **Verify Shutdown**: Wait for the Instance State to change to **Stopped**. Try to SSH into your instance again. Confirm that you are unable to connect (the command should hang or be refused).

3. **Get Instance ID**: In the AWS Console, make a note of your instance's **Instance ID**, for example: `i-0ba3afb7ac5f85a7f`.

4. **Start via CLI**: Now use the [AWS CLI](https://aws.amazon.com/cli/) on your local machine to [start your instance](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/ec2/start-instances.html). Run the `aws ec2 start-instances` command, replacing `{instance-id}` with the ID you noted in the previous step.

   You should get JSON output indicating that your instance is starting (i.e., `CurrentState.Name = "pending"`) similar to what is included below:

```sh
aws ec2 start-instances --instance-ids {instance-id}
```

**Example Output:**

```json
{
  "StartingInstances": [
    {
      "CurrentState": {
        "Code": 0,
        "Name": "pending"
      },
      "InstanceId": "i-0ba3afb7ac5f85a7f",
      "PreviousState": {
        "Code": 80,
        "Name": "stopped"
      }
    }
  ]
}
```

**Take a screenshot of the AWS CLI command and output you got.**

1. **Verify Startup**: Go back to the **AWS Console** (refresh the page if necessary) and confirm that your instance's **Instance state** is now **Running**.

2. **Stop via CLI**: Now [stop your instance](https://docs.aws.amazon.com/cli/latest/reference/ec2/stop-instances.html) using the CLI. Run the `aws ec2 stop-instances` command, replacing `{instance-id}` with your Instance ID. You should get JSON output indicating that your instance is stopping (i.e., `CurrentState.Name = "stopping"`) similar to what is included below:

```sh
aws ec2 stop-instances --instance-ids {instance-id}
```

**Example Output:**

```json
{
  "StoppingInstances": [
    {
      "CurrentState": {
        "Code": 64,
        "Name": "stopping"
      },
      "InstanceId": "i-0ba3afb7ac5f85a7f",
      "PreviousState": {
        "Code": 16,
        "Name": "running"
      }
    }
  ]
}
```

**Take a screenshot of the AWS CLI command and output you got.**

1. **Final Check**: Go back to the **AWS Console** and confirm that your instance's **Instance state** is now **Stopped** (you might need to click refresh first).

## Submission

In order to submit your lab, please do all of the following steps and submit the results to Blackboard in a document:

- Screenshot of your running EC2 instance details in the AWS Console
- Screenshot of accessing your microservice's health check running on EC2 via the browser
- Screenshot of accessing your microservice's health check running on EC2 via curl in a terminal on your local computer
- Screenshot of accessing your microservice's health check running on EC2 via curl in a terminal on the EC2 instance accessed via localhost
- Screenshot of starting your EC2 instance in the AWS CLI with output
- Screenshot of stopping your EC2 instance in the AWS CLI with output
- Screenshot of your current account costs in the AWS Console

> [!IMPORTANT]
> Make sure that your EC2 instance(s) are all stopped once you finish the lab, so your costs don't continue to increase when you aren't using them.
