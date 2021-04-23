FROM openjdk:8

RUN wget https://github.com/PolyMarsDev/Sokobot/releases/download/2.0/Sokobot-2.0.jar
COPY token.txt .
RUN java -jar Sokobot-2.0.jar