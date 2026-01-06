FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

WORKDIR /src
COPY ["src/HelpDesk.Web.Host/HelpDesk.Web.Host.csproj", "src/HelpDesk.Web.Host/"]
COPY ["src/HelpDesk.Web.Core/HelpDesk.Web.Core.csproj", "src/HelpDesk.Web.Core/"]
COPY ["src/HelpDesk.Application/HelpDesk.Application.csproj", "src/HelpDesk.Application/"]
COPY ["src/HelpDesk.Core/HelpDesk.Core.csproj", "src/HelpDesk.Core/"]
COPY ["src/HelpDesk.EntityFrameworkCore/HelpDesk.EntityFrameworkCore.csproj", "src/HelpDesk.EntityFrameworkCore/"]
WORKDIR "/src/src/HelpDesk.Web.Host"
RUN dotnet restore 

WORKDIR /src
COPY ["src/HelpDesk.Web.Host", "src/HelpDesk.Web.Host"]
COPY ["src/HelpDesk.Web.Core", "src/HelpDesk.Web.Core"]
COPY ["src/HelpDesk.Application", "src/HelpDesk.Application"]
COPY ["src/HelpDesk.Core", "src/HelpDesk.Core"]
COPY ["src/HelpDesk.EntityFrameworkCore", "src/HelpDesk.EntityFrameworkCore"]
WORKDIR "/src/src/HelpDesk.Web.Host"
RUN dotnet publish -c Release -o /publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0
EXPOSE 80
WORKDIR /app
COPY --from=build /publish .
ENTRYPOINT ["dotnet", "HelpDesk.Web.Host.dll"]
