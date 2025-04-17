pipeline {
  agent any

  environment {
    AWS_REGION = 'us-east-1'
    ECR_REPO = '971422685558.dkr.ecr.us-east-1.amazonaws.com/frontend-demo' // Your ECR repo
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
          COMMIT_HASH = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
          IMAGE_TAG = "${COMMIT_HASH}"
          env.IMAGE_TAG = IMAGE_TAG
          sh "docker build -t ${ECR_REPO}:${IMAGE_TAG} ."
        }
      }
    }

    stage('Push to ECR') {
      steps {
        withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-credentials']]) {
          sh """
            aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REPO}
            docker push ${ECR_REPO}:${IMAGE_TAG}
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
          ssh -o StrictHostKeyChecking=no -i ${SSH_KEY} ubuntu@${EC2_HOST} << EOF
            aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REPO}
            docker pull ${ECR_REPO}:${IMAGE_TAG}

            docker stop frontend-demo || true
            docker rm frontend-demo || true
            sleep 5

            docker run -d --name frontend-demo -p 3000:3000 ${ECR_REPO}:${IMAGE_TAG}

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
