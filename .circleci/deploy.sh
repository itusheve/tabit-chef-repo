#!/bin/bash
# This script is meant to be run from a Circle CI job to automatically deploy to the specified environment.

set -e

function deploy {
    git clone git@github.com:inPact/infrastructure-live.git /tmp/infrastructure-live
    # change dir so git add in terraform-update-variable will work
    cd /tmp/infrastructure-live
    for region in "${REGIONS[@]}"
    do
      for service in "${SERVICES[@]}"
      do
        SERVICE_PATH="$ACCOUNT/$region/$ROS_ENV/services/$service"
    	  terraform-update-variable --name "image_version" --value "$(echo $CIRCLE_SHA1 | cut -c -7)-$CIRCLE_BRANCH" --tfvars-path "/tmp/infrastructure-live/$SERVICE_PATH/terraform.tfvars"
        terragrunt apply --terragrunt-working-dir "/tmp/infrastructure-live/$SERVICE_PATH"  --terragrunt-iam-role "$IAM_ROLE_ARN" -input=false --terragrunt-non-interactive -auto-approve
      done
    done
}
echo "On0"
if [[ "$CIRCLE_TAG" =~ ^release-.*$ ]]; then
  echo "not in use"
elif [[ "$CIRCLE_BRANCH" == "master" ]]; then
  echo "Not in use"
elif [[ "$CIRCLE_BRANCH" == "ecs-dev" ]]; then
  npm cache clean -f
  npm install -g n
  n stable
  npm i -g npm
  npm install --ignore-scripts
  npm rebuild node-sass
  ng build --prod
  chmod +x _s3/s3-push-dev.sh
  S3_BUCKET="chef.tabit-dev.com" _s3/s3-push-dev.sh
  echo "On $CIRCLE_BRANCH branch. Deploying $SERVICES to $ACCOUNT in $REGIONS"
elif [[ "$CIRCLE_BRANCH" == "ecs-stage" ]]; then
  npm cache clean -f
  npm install -g n
  n stable
  npm i -g npm
  npm install --ignore-scripts
  npm rebuild node-sass
  ng build --configuration=stage
  chmod +x _s3/s3-push-stage.sh
  S3_BUCKET="chef.tabit-stage.com" _s3/s3-push-stage.sh
  echo "On $CIRCLE_BRANCH branch. Deploying $SERVICES to $ACCOUNT in $REGIONS"
elif [[ "$CIRCLE_BRANCH" == "ecs-chef-prod"  ]]; then
  echo "On1"
  npm cache clean -f
  npm install -g n
  n stable
  npm i -g npm
  npm install --ignore-scripts
  npm rebuild node-sass
  echo "On2"
  ng build --prod
  echo "On3"
  chmod +x _s3/s3-push-us-prod.sh
  echo "On4"
  S3_BUCKET="chef-prod.tabit.cloud" _s3/s3-push-us-prod.sh
  echo "On $CIRCLE_BRANCH branch. Deploying $SERVICES to $ACCOUNT in $REGIONS"
elif [[ "$CIRCLE_BRANCH" == "util" ]]; then
  echo "On $CIRCLE_BRANCH branch. Deploying $SERVICES to $ACCOUNT in $REGIONS"
# elif [[ "$CIRCLE_BRANCH" == "<THE_BRANCH_YOU_WANT_TO_DEPLOY>" ]]; then

#   echo "On $CIRCLE_BRANCH branch. Deploying $SERVICES to $ACCOUNT in $REGIONS"
else
  echo "Did not find release tag or master branch, so skipping deploy."
  exit 0
fi

#eval $(aws ecr get-login --region "eu-west-1" --no-include-email --registry-ids "075139435924")

# All commits will be from the machine user
git config --global user.name "tabit-ci"
git config --global user.email "jim+tabit-ci@gruntwork.io"
git config --global push.default simple

#deploy
