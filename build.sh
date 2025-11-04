[ "$#" -ne 1 ] && echo Usage: sh build.sh tag_name\n && exit 1
mvn clean package -Dmaven.test.skip
echo $1
docker build -t "$1" --build-arg JAR_FILE=target/*.jar .

