#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$DIR/.." && pwd)"

echo "=== Building Emergency Dispatch Tomcat Module ==="

# 1. Setup build directories
mkdir -p "$DIR/build/WEB-INF/classes"
mkdir -p "$DIR/build/WEB-INF/lib"
mkdir -p "$DIR/target"

# 2. Copy web files
cp -r "$DIR/web/"* "$DIR/build/"
cp "$ROOT_DIR/lib/mysql-connector-j-9.6.0.jar" "$DIR/build/WEB-INF/lib/"

# 3. Compile Servlet using Tomcat 10 servlet-api
TOMCAT_SERVLET_JAR="/usr/share/java/tomcat10-servlet-api.jar"
if [ ! -f "$TOMCAT_SERVLET_JAR" ]; then
  TOMCAT_SERVLET_JAR="/usr/share/tomcat10/lib/servlet-api.jar"
fi

echo "Compiling EmergencyStatusServlet..."
javac -cp "$TOMCAT_SERVLET_JAR:$ROOT_DIR/lib/mysql-connector-j-9.6.0.jar" \
      -d "$DIR/build/WEB-INF/classes" \
      "$DIR/src/EmergencyStatusServlet.java"

# 4. Package WAR file
echo "Packaging emergency-dispatch.war..."
(cd "$DIR/build" && jar -cvf "$DIR/target/emergency-dispatch.war" .)

# 5. Deploy to live Tomcat webapps (assignment30 directory which is accessible to user)
echo "Deploying JSP to live Tomcat (/var/lib/tomcat10/webapps/assignment30/)..."
cp "$DIR/web/index.jsp" "/var/lib/tomcat10/webapps/assignment30/emergency-status.jsp"

echo "=== Build and Deployment Complete! ==="
echo "WAR created at: $DIR/target/emergency-dispatch.war"
echo "Live Tomcat JSP URL: http://localhost:8080/assignment30/emergency-status.jsp"
