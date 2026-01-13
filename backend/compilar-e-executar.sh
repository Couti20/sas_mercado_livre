#!/bin/bash
cd "c:/Users/Michael/Desktop/sas_mercado_livre/backend"
echo "Compilando Backend..."
mvn clean package -DskipTests -X
echo "Compilação concluída!"
java -jar target/price-monitor-1.0.0.jar
