FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
COPY . .
EXPOSE 4500

# Use SDK image to build the app
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["SimpleStreamer.csproj", "./"]
RUN dotnet restore "SimpleStreamer.csproj"
COPY . .
RUN dotnet build "SimpleStreamer.csproj" -c Release -o /app/build