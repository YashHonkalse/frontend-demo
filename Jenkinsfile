pipeline {
  agent any

  environment {
    AWS_REGION = 'us-east-1'
    ECR_URL = '971422685558.dkr.ecr.us-east-1.amazonaws.com/frontend-demo'
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
          def imageName = "${env.JOB_NAME}".toLowerCase().replaceAll("/", "-")
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
            docker tag ${IMAGE_NAME}:latest ${ECR_URL}/${IMAGE_NAME}:latest
            docker push ${ECR_URL}/${IMAGE_NAME}:latest
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
            docker pull ${ECR_URL}/${IMAGE_NAME}:latest

            docker stop ${IMAGE_NAME} || true
            sleep 5

            docker run -d --name ${IMAGE_NAME} -p 3000:3000 ${ECR_URL}/${IMAGE_NAME}:latest

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
