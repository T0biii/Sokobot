FROM openjdk:8

RUN git clone https://github.com/T0biii/Sokobot
WORKDIR /Sokobot
RUN chmod +x gradlew && ./gradlew build
RUN mv build/libs/Sokobot-1.1-all.jar .
ENTRYPOINT  java -jar Sokobot-1.1-all.jar