FROM openjdk:8

RUN git clone https://github.com/T0biii/Sokobot
WORKDIR /Sokobot
RUN chmod +x gradlew && ./gradlew build
COPY token.txt build/libs/token.txt
RUN java -jar build/libs/Sokobot-1.1-all.jar