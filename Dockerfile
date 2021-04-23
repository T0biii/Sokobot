FROM openjdk:8

RUN wget https://github.com/PolyMarsDev/Sokobot/releases/download/2.0/Sokobot-2.0.jar
COPY token.txt build/libs/token.txt
RUN java -jar build/libs/Sokobot-1.1.jar