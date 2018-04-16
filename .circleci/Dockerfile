# The CircleCi builds will run in the Docker image built from this Dockerfile. To build a new image:
#
# 1. docker build --build-arg GITHUB_OAUTH_TOKEN=<token> -t 075139435924.dkr.ecr.eu-west-1.amazonaws.com/chef:<VERSION> .
# 2. eval "$(aws ecr get-login --region eu-west-1 --no-include-email --registry-ids "075139435924")"
# 3. docker push 075139435924.dkr.ecr.eu-west-1.amazonaws.com/chef:<VERSION>
# 4. Update the image setting in config.yml to your new VERSION.



# Note that we use a multi-stage build. This allows us to pass in the GITHUB_OAUTH_TOKEN secret (which we use to access
# the private gruntwork-io repos) as a build arg without it being stored in the build history. For more info, see:
#
# https://stackoverflow.com/a/40762010/483528
# https://vsupalov.com/build-docker-image-clone-private-repo-ssh-key/
#
FROM ubuntu:16.04 as intermediate

# You must set a GitHub personal access token as a build arg. This will be used to access the private gruntwork-io
# GitHub repos
ARG GITHUB_OAUTH_TOKEN
RUN if [ -z "$GITHUB_OAUTH_TOKEN" ]; then echo "ERROR: You must set GITHUB_OAUTH_TOKEN as an environment variable."; exit 1; fi
ENV GRUNTWORK_INSTALLER_VERSION v0.0.20
ENV MODULE_CI_VERSION v0.6.0
ENV TERRAFORM_VERSION 0.11.3
ENV TERRAGRUNT_VERSION v0.14.0

RUN apt-get update && \
    apt-get install -y curl wget unzip sudo

RUN wget "https://releases.hashicorp.com/terraform/${TERRAFORM_VERSION}/terraform_${TERRAFORM_VERSION}_linux_amd64.zip" && \
    unzip -o "terraform_${TERRAFORM_VERSION}_linux_amd64.zip" -d "/tmp/"

RUN wget "https://github.com/gruntwork-io/terragrunt/releases/download/${TERRAGRUNT_VERSION}/terragrunt_linux_amd64" && \
    mv terragrunt_linux_amd64 "/tmp/terragrunt" && \
    chmod u+x "/tmp/terragrunt"

RUN curl -Ls https://raw.githubusercontent.com/gruntwork-io/gruntwork-installer/master/bootstrap-gruntwork-installer.sh | bash /dev/stdin --version "$GRUNTWORK_INSTALLER_VERSION" && \
    gruntwork-install --repo "https://github.com/gruntwork-io/module-ci" --module-name "build-helpers" --tag "$MODULE_CI_VERSION" && \
    gruntwork-install --repo "https://github.com/gruntwork-io/module-ci" --module-name "terraform-helpers" --tag "$MODULE_CI_VERSION"

# This is the real Docker image that will be created in the end. It just carefully copies code from the intermediate.
FROM ubuntu:16.04

RUN apt-get update && \
    apt-get install -y git apt-transport-https ca-certificates curl software-properties-common jq python-pip && \
    pip install awscli

# Here we install Docker in Docker. We need it because our builds will run, well, Docker! Note that all we're really
# using is the Docker client, as CircleCi will mount a socket for us to talk to a Docker server outside of this
# container.
RUN curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add - && \
    add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" && \
    apt-get update && \
    apt-get install -y docker-ce


COPY --from=intermediate /usr/local/bin/build-docker-image /usr/local/bin/build-docker-image
COPY --from=intermediate /usr/local/bin/terraform-update-variable /usr/local/bin/terraform-update-variable
COPY --from=intermediate /tmp/terraform /usr/local/bin/terraform
COPY --from=intermediate /tmp/terragrunt /usr/local/bin/terragrunt
