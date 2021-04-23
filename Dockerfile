FROM openjdk:8

# Update & install packages & cleanup afterwards
RUN apt-get -y install &&\ 
    git &&\
    wget  &&\
    apt-get clean autoclean && \
    apt-get autoremove && \
    rm -rf /var/lib/apt/lists/*

RUN git clone https://github.com/T0biii/Sokobot.git
RUN ./gradlew build
RUN java -jar Sokobot/build/libs/Sokobot-1.1-all.jar