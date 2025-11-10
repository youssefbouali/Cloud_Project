resource "aws_cognito_user_pool" "fittrack" {
  name = "${var.app_name}-${var.environment}-pool"

  password_policy {
    minimum_length    = var.cognito_password_min_length
    require_lowercase = true
    require_numbers   = true
    require_symbols   = false
    require_uppercase = true
  }

  auto_verified_attributes = ["email"]

  email_configuration {
    email_sending_account = "COGNITO_DEFAULT"
  }

  username_attributes = ["email"]

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  schema {
    name              = "email"
    attribute_data_type = "String"
    mutable           = true
    required          = true
  }

  schema {
    name              = "name"
    attribute_data_type = "String"
    mutable           = true
  }

  user_attribute_update_settings {
    attributes_require_verification_before_update = ["email"]
  }

  tags = var.tags
}

resource "aws_cognito_user_pool_client" "fittrack_web" {
  name                = "${var.app_name}-${var.environment}-web-client"
  user_pool_id        = aws_cognito_user_pool.fittrack.id
  generate_secret     = false
  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
  ]

  allowed_oauth_flows = ["code", "implicit"]
  allowed_oauth_scopes = [
    "phone",
    "email",
    "openid",
    "profile",
  ]
  allowed_oauth_flows_user_pool_client = true

  callback_urls = concat(
    ["http://localhost:3000/auth/callback"],
    var.frontend_domain != "" ? ["https://${var.frontend_domain}/auth/callback"] : []
  )

  logout_urls = concat(
    ["http://localhost:3000"],
    var.frontend_domain != "" ? ["https://${var.frontend_domain}"] : []
  )

  read_attributes  = ["email", "name", "phone_number"]
  write_attributes = ["email", "name", "phone_number"]

  depends_on = [aws_cognito_user_pool.fittrack]
}

resource "aws_cognito_identity_pool" "fittrack" {
  identity_pool_name             = "${var.app_name}_${var.environment}_identity_pool"
  allow_unauthenticated_identities = false

  cognito_identity_providers {
    client_id              = aws_cognito_user_pool_client.fittrack_web.id
    provider_name          = aws_cognito_user_pool.fittrack.endpoint
    server_side_token_validation = false
  }

  depends_on = [aws_cognito_user_pool.fittrack, aws_cognito_user_pool_client.fittrack_web]
}

resource "aws_cognito_identity_pool_roles_attachment" "fittrack" {
  identity_pool_id = aws_cognito_identity_pool.fittrack.id

  roles = {
    authenticated   = aws_iam_role.cognito_authenticated.arn
    unauthenticated = aws_iam_role.cognito_unauthenticated.arn
  }

  depends_on = [
    aws_cognito_identity_pool.fittrack,
    aws_iam_role.cognito_authenticated,
    aws_iam_role.cognito_unauthenticated
  ]
}

resource "aws_iam_role" "cognito_authenticated" {
  name = "${var.app_name}-${var.environment}-cognito-auth-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = "cognito-identity.amazonaws.com"
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "cognito-identity.amazonaws.com:aud" = aws_cognito_identity_pool.fittrack.id
          }
          ForAllValues = {
            "cognito-identity.amazonaws.com:auth_time" = "authenticated"
          }
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "cognito_authenticated_s3" {
  name   = "${var.app_name}-${var.environment}-cognito-s3-policy"
  role   = aws_iam_role.cognito_authenticated.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject"
        ]
        Resource = "${aws_s3_bucket.activity_photos.arn}/activities/$${aws:username}/*"
      }
    ]
  })
}

resource "aws_iam_role" "cognito_unauthenticated" {
  name = "${var.app_name}-${var.environment}-cognito-unauth-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = "cognito-identity.amazonaws.com"
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "cognito-identity.amazonaws.com:aud" = aws_cognito_identity_pool.fittrack.id
          }
        }
      }
    ]
  })
}
