FROM octplane/basebox:latest

ADD . /home/apps

RUN apt-get -y install wget python gcc make git g++

# Install Node.js
# RUN \
#   cd /tmp && \
#   wget http://nodejs.org/dist/node-latest.tar.gz && \
#   tar xvzf node-latest.tar.gz && \
#   rm -f node-latest.tar.gz && \
#   cd node-v* && \
#   ./configure && \
#   CXX="g++ -Wno-unused-local-typedefs" make && \
#   CXX="g++ -Wno-unused-local-typedefs" make install && \
#   cd /tmp && \
#   rm -rf /tmp/node-v*

# ENV PATH node_modules/.bin:$PATH
# RUN echo 'PATH=node_modules/.bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin' >> /etc/profile.d/nodejs.sh
# WORKDIR /root
# RUN npm install -g grunt-cli

# RUN chown -R apps:apps /home/apps



# ### In Dockerfile:
# RUN mkdir /etc/service/rails
# ADD rails.sh /etc/service/rails/run
# RUN chmod +x /etc/service/rails/run

# Clean up APT when done.
RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

WORKDIR /home/apps
RUN rm -rf /home/apps/tmp/
# USER apps
# RUN npm install
# RUN bower --config.interactive=false install
