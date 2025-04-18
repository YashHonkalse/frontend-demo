pipeline {
  agent any

  environment {
    AWS_REGION = 'us-east-1'
    ECR_REPO = '971422685558.dkr.ecr.us-east-1.amazonaws.com/frontend-demo'
    SSH_KEY = credentials('ec2_id')
    EC2_HOST = '18.212.172.14'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Get Branch Name') {
      steps {
        script {
          def branchName = sh(
            script: '''
              git branch --remote --contains HEAD | grep -Eo 'origin/[^ ]+' | head -1 | sed 's|origin/||'
            ''',
            returnStdout: true
          ).trim()

          if (!branchName) {
            branchName = sh(script: 'git rev-parse --abbrev-ref HEAD', returnStdout: true).trim()
          }

          env.BRANCH_NAME = branchName
          echo "Branch: ${env.BRANCH_NAME}"
        }
      }
    }

    stage('Build Docker Image') {
      steps {
        script {
          def commitHash = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
          env.IMAGE_TAG = commitHash
          sh "docker build -t ${ECR_REPO}:${env.IMAGE_TAG} ."
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
        expression { env.BRANCH_NAME == 'main' }
      }
      steps {
        script {
          sh """
            ssh -o StrictHostKeyChecking=no -i ${SSH_KEY} ubuntu@${EC2_HOST} '
              aws ecr get-login-password --region ${AWS_REGION} | sudo docker login --username AWS --password-stdin ${ECR_REPO}
              sudo docker pull ${ECR_REPO}:${IMAGE_TAG}

              sudo docker stop frontend-demo || true
              sudo docker rm frontend-demo || true
              sleep 5

              sudo docker run -d --name frontend-demo -p 3000:3000 ${ECR_REPO}:${IMAGE_TAG}

              sudo docker image prune -af
            '
          """
        }
      }
    }
  }

  post {
    always {
      cleanWs()
    }
  }
}
