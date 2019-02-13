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
ENV MODULE_CI_VERSION v0.7.1
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
    gruntwork-install --repo "https://github.com/gruntwork-io/module-ci" --module-name "terraform-helpers" --tag "$MODULE_CI_VERSION" && \
    gruntwork-install --repo "https://github.com/gruntwork-io/module-security" --module-name "aws-auth" --tag "v0.6.5"

RUN chmod u+x /usr/local/bin/aws-auth

# This is the real Docker image that will be created in the end. It just carefully copies code from the intermediate.
FROM ubuntu:16.04

USER root

RUN apt-get update && \
    apt-get install -y git apt-transport-https ca-certificates curl software-properties-common jq python-pip && \
    pip install awscli

RUN groupadd --gid 1000 node \
  && useradd --uid 1000 --gid node --shell /bin/bash --create-home node

# gpg keys listed at https://github.com/nodejs/node#release-team
RUN set -ex \
  && for key in \
    94AE36675C464D64BAFA68DD7434390BDBE9B9C5 \
    FD3A5288F042B6850C66B31F09FE44734EB7990E \
    71DCFD284A79C3B38668286BC97EC7A07EDE3FC1 \
    DD8F2338BAE7501E3DD5AC78C273792F7D83545D \
    C4F0DFFF4E8C1A8236409D08E73BC641CC11F4C8 \
    B9AE9905FFD7803F25714661B63B535A4C206CA9 \
    56730D5401028683275BD23C23EFEFE93C4CFFFE \
    77984A986EBC2AA786BC0F66B01FBB92821C587A \
  ; do \
    gpg --keyserver hkp://p80.pool.sks-keyservers.net:80 --recv-keys "$key" || \
    gpg --keyserver hkp://ipv4.pool.sks-keyservers.net --recv-keys "$key" || \
    gpg --keyserver hkp://pgp.mit.edu:80 --recv-keys "$key" ; \
  done

#install node
ENV NODE_VERSION 8.15.0

RUN ARCH= && dpkgArch="$(dpkg --print-architecture)" \
  && case "${dpkgArch##*-}" in \
    amd64) ARCH='x64';; \
    ppc64el) ARCH='ppc64le';; \
    *) echo "unsupported architecture"; exit 1 ;; \
  esac \
  && curl -SLO "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-$ARCH.tar.xz" \
  && curl -SLO --compressed "https://nodejs.org/dist/v$NODE_VERSION/SHASUMS256.txt.asc" \
  && gpg --batch --decrypt --output SHASUMS256.txt SHASUMS256.txt.asc \
  && grep " node-v$NODE_VERSION-linux-$ARCH.tar.xz\$" SHASUMS256.txt | sha256sum -c - \
  && tar -xJf "node-v$NODE_VERSION-linux-$ARCH.tar.xz" -C /usr/local --strip-components=1 --no-same-owner \
  && rm "node-v$NODE_VERSION-linux-$ARCH.tar.xz" SHASUMS256.txt.asc SHASUMS256.txt \
  && ln -s /usr/local/bin/node /usr/local/bin/nodejs

RUN apt-get update
RUN apt-get install -y software-properties-common
RUN add-apt-repository ppa:openjdk-r/ppa
RUN apt-get update
RUN apt-get install --fix-missing -y -f openjdk-7-jre

#RUN apt-get update && apt-get install -y sudo && rm -rf /var/lib/apt/lists/*

# install s3_website
RUN apt-get update && \
    apt-get install -y jq python-pip ruby && \
    gem install s3_website && \
    npm install -g @angular/cli@1.7.2 --unsafe

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
COPY --from=intermediate /usr/local/bin/aws-auth /usr/local/bin/aws-auth
