FROM openjdk:8

RUN wget https://github.com/T0biii/Sokobot/raw/master/Versions/Sokobot-1.2-all.jar
COPY token.txt .
ENTRYPOINT  java -jar Sokobot-1.2-all.jar