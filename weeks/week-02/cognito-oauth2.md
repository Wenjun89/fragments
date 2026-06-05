# Week 2: Getting Started with AWS and Amazon Cognito

## Lecture

<https://www.youtube.com/watch?v=U0-5ziBQxzg>

## Introduction

This week we will focus on getting you started with AWS through the CloudLabs and introduce you to your first cloud service: Amazon Cognito. We are beginning with a security-related service intentionally, as security should be a primary concern when working with cloud technologies.

Amazon Cognito will allow us to implement authentication and authorization without writing extensive code, making it an excellent first service to explore. We will also review authentication and authorization concepts, including JWT (JSON Web Token) based authentication with authorization grants.

## AWS Accounts and CloudLabs

### Why Use AWS Academy Instead of Personal Accounts

While you could create your own AWS account, we strongly recommend using CloudLabs to access AWS for this course. The primary reasons include:

- **No credit card required**: You won't need to provide payment information
- **Billing protection**: The account protects you from overspending and costly mistakes
- **Safe experimentation environment**: You can learn without risking unexpected charges
- **Cost limits**: Protection against waking up to massive cloud bills

### Getting Started with CloudLabs

You will receive an email invitation to CloudLabs, which will allow you to **Launch** a lab environment you can use for the whole course. The lab environment will give you a URL to use when logging into AWS, as well as a username and password, access keys, and other necessary information.

### Lab Environment Management

#### Launching the CloudLabs Environment

- When you receive your invitation email and click **Launch Lab**, your lab environment will be crated and activated (takes 5 minutes initially)
- Your AWS account will be available for the entire course
- You have $50 USD in credits to spend

#### Important Features

- **AWS Credentials**: Access to your AWS login credentials
- **Access Key Details**: Access keys for using AWS SDKs and CLIs
- **Cost monitoring**: Track your spending against the $50 credit limit using the **Cost and usage** widget in the AWS console once logged in. (NOTE: updates may be delayed up to 12 hours)

### Cost Management and Free Tier

Your account includes $50 in credits for the entire term. Based on previous course experience:

- Everything this week will be essentially free (within free tier limits)
- Free tier varies by service (some free forever, others free for first year)
- Be cautious about experimenting beyond assigned work

**Warning**: Some students have spent a lot in just two days by experimenting with expensive services. Once credits are exhausted, no additional credits can be provided.

## AWS Management Console

### Accessing AWS Services

The AWS Management Console serves as a graphical client for AWS APIs, and using allows you to:

- Manually configure services through point-and-click interfaces
- Learn service features without coding
- Perform administrative tasks

### Important Console Considerations

- **Region selection**: Always use US East 2 (Ohio) for this course
- **Service access**: The CloudLabs environment does not give access to all AWS services. Only those required for the course will work.

### Alternative Access Methods

Everything possible in the console can also be accomplished through:

- **Command Line Interface (CLI)**: Available in the lab terminal
- **Software Development Kits (SDKs)**: For programmatic access in various languages
- **APIs**: Direct HTTP requests to AWS endpoints

## Amazon Cognito Overview

### Why Use Cognito?

Amazon Cognito addresses the critical need for user authentication and authorization without the security risks of managing user accounts yourself. Key benefits include:

- **Security expertise**: Leverages Amazon's dedicated security teams
- **Reduced liability**: Eliminates the risk of data breaches from poor password management
- **Focus on core business**: Allows developers to concentrate on application logic rather than security infrastructure

### Cognito User Pools

User Pools provide:

- User directory/database management
- Sign-up and sign-in functionality
- Multi-factor authentication support
- Secure password handling
- Token-based authorization
- Hosted UI for authentication flows

### Cost Structure

Cognito offers exceptional value:

- **Free tier**: First 50,000 monthly active users forever
- **Scalable pricing**: Fractions of a penny per user beyond free tier
- **No upfront costs**: Pay only for actual usage

## JWT (JSON Web Token) Architecture

### Token Structure

JWTs consist of three base64-URL encoded sections separated by dots:

1. **Header** (red): Contains algorithm information for token signing
2. **Payload** (purple): Contains claims about the user and session
3. **Signature** (blue): Cryptographic signature for verification

### Token Verification Process

Our microservice will:

1. Receive tokens via Authorization header as Bearer tokens
2. Verify tokens cryptographically using Amazon's public keys
3. Check token expiration and validity
4. Extract user claims (primarily email) for authorization decisions
5. Allow or deny requests based on token validity

### Token Types

When authentication succeeds, Cognito returns three tokens:

- **Access Token**: Proves authorization to perform specific actions
- **Identity Token**: Contains user information and claims (we'll use this)
- **Refresh Token**: Allows obtaining new tokens without re-authentication

## OAuth 2.0 Flow Implementation

### The Authentication Process

Our implementation follows the standard OAuth 2.0 authorization code flow:

1. **Initial Request**: User visits Fragments UI web application
2. **Login Redirect**: Application redirects to Cognito authorization endpoint
3. **Authentication**: User enters credentials on Cognito-hosted login page
4. **Authorization Code**: Cognito redirects back with authorization code
5. **Token Exchange**: Application exchanges code for tokens
6. **API Access**: Application uses tokens to access protected microservice endpoints

### URL Parameters and Security

The authorization URL includes several critical parameters:

- **redirect_uri**: Pre-configured callback URL for security
- **response_type**: Specifies code-based flow
- **client_id**: Amazon-generated identifier for your application
- **scope**: Requested user information (email, profile, openid)
- **state**: Random string for CSRF protection
- **code_challenge**: PKCE security enhancement

### Distributed Architecture Benefits

This approach provides:

- **Separation of concerns**: Authentication logic separate from business logic
- **Scalability**: Independent scaling of authentication and application services
- **Security**: Centralized, expert-managed authentication
- **Flexibility**: Multiple applications can use the same authentication service

## Implementation with AWS Amplify

### Why Use Amplify Auth?

Rather than implementing the complex OAuth 2.0 flow manually, we use AWS Amplify's authentication module because:

- **Tested and maintained**: Amazon provides and maintains the code
- **Handles complexity**: Manages redirects, token refresh, and security automatically
- **Reduces errors**: Eliminates common implementation mistakes
- **Focus on features**: Allows concentration on application functionality

### Development Approach

For this course, we will:

- Use vanilla JavaScript, HTML, and CSS for the Fragments UI
- Focus on cloud service interactions rather than frontend frameworks
- Build a simple testing interface for demonstrating microservice functionality
- Gradually enhance the interface throughout the term

## Security and Cloud Considerations

### Security as a Primary Concern

Security must be considered from the beginning of any cloud project because:

- **Exposure**: Cloud applications are accessible from the internet
- **Shared responsibility**: You are responsible for application-level security
- **Attack surface**: Multiple entry points require comprehensive protection
- **Data protection**: User data and business logic need safeguarding

### Cost Awareness in Cloud Development

Cloud computing requires developers to consider cost alongside traditional factors:

- **On-demand billing**: Pay for what you use
- **Architectural impact**: Design decisions affect costs
- **Resource optimization**: Efficient use of services reduces expenses
- **Monitoring**: Regular cost tracking prevents surprises

## Next Steps

This week's lab will guide you through:

1. Setting up your AWS CloudLabs account
2. Creating and configuring an Amazon Cognito User Pool
3. Building a basic Fragments UI web application
4. Implementing OAuth 2.0 authentication flow
5. Testing token-based API access

Remember that security complexity is necessary for protection. While the authentication flow may seem complicated, it provides robust security for your applications and users. Focus on understanding the concepts and using proven tools rather than building security features from scratch.
