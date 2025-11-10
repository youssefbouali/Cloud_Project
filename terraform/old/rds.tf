resource "aws_db_subnet_group" "fittrack" {
  name       = "${var.app_name}-${var.environment}-db-subnet-group"
  subnet_ids = aws_subnet.private[*].id

  tags = var.tags
}

resource "aws_security_group" "rds" {
  name        = "${var.app_name}-${var.environment}-rds-sg"
  description = "Security group for RDS"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.elastic_beanstalk.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = var.tags
}

resource "aws_db_instance" "fittrack" {
  identifier            = "${var.app_name}-${var.environment}-db"
  engine                = "postgres"
  engine_version        = "14.15"
  instance_class        = var.db_instance_class
  allocated_storage     = var.db_allocated_storage
  storage_encrypted     = true
  db_subnet_group_name  = aws_db_subnet_group.fittrack.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  db_name  = replace(var.db_name, "-", "_")
  username = var.db_username
  password = var.db_password

  backup_retention_period = 30
  backup_window           = "03:00-04:00"
  maintenance_window      = "sun:04:00-sun:05:00"
  multi_az                = false
  publicly_accessible     = false

  skip_final_snapshot       = false
  final_snapshot_identifier = "${var.app_name}-${var.environment}-final-snapshot-${formatdate("YYYY-MM-DD-hhmmss", timestamp())}"

  tags = var.tags

  depends_on = [aws_security_group.rds, aws_db_subnet_group.fittrack]
}

resource "aws_secretsmanager_secret" "db_credentials" {
  name                    = "${var.app_name}/${var.environment}/db"
  description             = "RDS database credentials for FitTrack"
  recovery_window_in_days = 7

  tags = var.tags
}

resource "aws_secretsmanager_secret_version" "db_credentials" {
  secret_id = aws_secretsmanager_secret.db_credentials.id
  secret_string = jsonencode({
    username = aws_db_instance.fittrack.username
    password = var.db_password
    host     = aws_db_instance.fittrack.endpoint
    port     = 5432
    dbname   = aws_db_instance.fittrack.db_name
    engine   = "postgresql"
  })
}

output "db_endpoint" {
  value       = aws_db_instance.fittrack.endpoint
  description = "RDS database endpoint"
}

output "db_name" {
  value       = aws_db_instance.fittrack.db_name
  description = "RDS database name"
}

output "db_credentials_secret_arn" {
  value       = aws_secretsmanager_secret.db_credentials.arn
  description = "ARN of the RDS credentials secret"
}
