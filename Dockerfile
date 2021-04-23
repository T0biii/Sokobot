FROM openjdk:8

ARG gitrepo
ARG version

RUN git clone $gitrepo
WORKDIR /Sokobot
RUN chmod +x gradlew && ./gradlew build
RUN mv build/libs/Sokobot-$version-all.jar .
ENTRYPOINT  java -jar Sokobot-$version-all.jar