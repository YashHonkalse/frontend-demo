pipeline {
  agent any

  environment {
    AWS_REGION = 'us-east-1'
    ECR_URL = '971422685558.dkr.ecr.us-east-1.amazonaws.com/frontend-demo' // ECR repo name
    SSH_KEY = credentials('ec2_id')
    EC2_HOST = '18.212.172.14'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm  
      }
    }

    stage('Build Docker Image') {
      steps {
        script {
          def imageName = "frontend-demo"  // Static name for the repo
          env.IMAGE_NAME = imageName
          sh "docker build -t ${imageName}:latest ."
        }
      }
    }

    stage('Push to ECR') {
      steps {
        withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-credentials']]) {
          sh """
            aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_URL}
            docker tag ${IMAGE_NAME}:latest ${ECR_URL}:latest  // Corrected tag format
            docker push ${ECR_URL}:latest  // Push to the correct repo
          """
        }
      }
    }

    stage('Deploy to EC2') {
      when {
        branch 'main'
      }
      steps {
        sh """
          ssh -o StrictHostKeyChecking=no -i ${SSH_KEY} ubuntu@${EC2_HOST} << 'EOF'
            aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_URL}
            docker pull ${ECR_URL}:latest  // Pull the correct image tag

            docker stop ${IMAGE_NAME} || true
            sleep 5

            docker run -d --name ${IMAGE_NAME} -p 3000:3000 ${ECR_URL}:latest  // Run container

            docker image prune -af
          EOF
        """
      }
    }
  }

  post {
    always {
      cleanWs()
    }
  }
}
