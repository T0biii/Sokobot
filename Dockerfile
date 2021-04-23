FROM openjdk:8

ARG gitrepo

RUN git clone $gitrepo
WORKDIR /Sokobot
RUN chmod +x gradlew && ./gradlew build
RUN mv build/libs/Sokobot-1.1-all.jar .
ENTRYPOINT  java -jar Sokobot-1.1-all.jar