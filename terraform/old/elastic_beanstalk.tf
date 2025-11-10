resource "aws_security_group" "elastic_beanstalk" {
  name        = "${var.app_name}-${var.environment}-eb-sg"
  description = "Security group for Elastic Beanstalk"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = var.tags
}

resource "aws_iam_role" "elastic_beanstalk_ec2" {
  name = "${var.app_name}-${var.environment}-eb-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "elastic_beanstalk_web_tier" {
  role       = aws_iam_role.elastic_beanstalk_ec2.name
  policy_arn = "arn:aws:iam::aws:policy/AWSElasticBeanstalkWebTier"
}

resource "aws_iam_role_policy_attachment" "elastic_beanstalk_worker_tier" {
  role       = aws_iam_role.elastic_beanstalk_ec2.name
  policy_arn = "arn:aws:iam::aws:policy/AWSElasticBeanstalkWorkerTier"
}

resource "aws_iam_role_policy_attachment" "elastic_beanstalk_ssm" {
  role       = aws_iam_role.elastic_beanstalk_ec2.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_role_policy" "elastic_beanstalk_secrets_manager" {
  name = "${var.app_name}-${var.environment}-eb-secrets-policy"
  role = aws_iam_role.elastic_beanstalk_ec2.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = [
          aws_secretsmanager_secret.db_credentials.arn,
          aws_secretsmanager_secret.cognito_credentials.arn
        ]
      }
    ]
  })
}

resource "aws_iam_instance_profile" "elastic_beanstalk_ec2" {
  name = "${var.app_name}-${var.environment}-eb-ec2-profile"
  role = aws_iam_role.elastic_beanstalk_ec2.name
}

resource "aws_elastic_beanstalk_application" "fittrack" {
  name            = "${var.app_name}-${var.environment}"
  description     = "FitTrack application"
  service_role    = aws_iam_role.elastic_beanstalk_service.arn

  tags = var.tags
}

resource "aws_iam_role" "elastic_beanstalk_service" {
  name = "${var.app_name}-${var.environment}-eb-service-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "elasticbeanstalk.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "elastic_beanstalk_service" {
  role       = aws_iam_role.elastic_beanstalk_service.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSElasticBeanstalkEnhancedHealth"
}

resource "aws_elastic_beanstalk_environment" "fittrack" {
  name            = "${var.app_name}-${var.environment}-env"
  application     = aws_elastic_beanstalk_application.fittrack.name
  solution_stack_name = "64bit Amazon Linux 2 v5.8.1 running Node.js 18"
  environment_type = "LoadBalanced"
  instance_type   = "t3.micro"
  min_instances   = 1
  max_instances   = 3

  vpc_id = aws_vpc.main.id
  subnets = join(",", aws_subnet.public[*].id)
  security_groups = aws_security_group.elastic_beanstalk.id

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "NODE_ENV"
    value     = var.environment
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "PORT"
    value     = "5000"
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "AWS_REGION"
    value     = var.aws_region
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "COGNITO_USER_POOL_ID"
    value     = aws_cognito_user_pool.fittrack.id
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "COGNITO_CLIENT_ID"
    value     = aws_cognito_user_pool_client.fittrack_web.id
  }

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "IamInstanceProfile"
    value     = aws_iam_instance_profile.elastic_beanstalk_ec2.name
  }

  environment_variables = {
    DATABASE_URL = "postgresql://${var.db_username}:${var.db_password}@${aws_db_instance.fittrack.endpoint}/${aws_db_instance.fittrack.db_name}"
  }

  tags = var.tags

  depends_on = [
    aws_elastic_beanstalk_application.fittrack,
    aws_db_instance.fittrack,
    aws_security_group.elastic_beanstalk
  ]
}

output "elastic_beanstalk_endpoint" {
  value       = aws_elastic_beanstalk_environment.fittrack.endpoint_url
  description = "Elastic Beanstalk environment endpoint"
}
