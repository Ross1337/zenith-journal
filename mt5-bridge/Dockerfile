FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive
ENV WINEARCH=win64
ENV WINEPREFIX=/root/.wine

# Install system dependencies
RUN apt-get update && apt-get install -y     software-properties-common     wget     curl     gnupg2     ca-certificates     xvfb     xauth     python3.11     python3-pip     cabextract     && rm -rf /var/lib/apt/lists/*

# Install Wine (winehq-stable)
RUN dpkg --add-architecture i386     && mkdir -pm755 /etc/apt/keyrings     && wget -O /etc/apt/keyrings/winehq-archive.key https://dl.winehq.org/wine-builds/winehq.key     && wget -NP /etc/apt/sources.list.d/ https://dl.winehq.org/wine-builds/ubuntu/dists/jammy/winehq-jammy.sources     && apt-get update     && apt-get install -y --install-recommends winehq-stable     && rm -rf /var/lib/apt/lists/*

# Install winetricks
RUN wget -q https://raw.githubusercontent.com/Winetricks/winetricks/master/src/winetricks     -O /usr/local/bin/winetricks     && chmod +x /usr/local/bin/winetricks

# Install Python packages
RUN pip3 install requests

# Download MT5 installer into image (cached in layer)
RUN wget -q https://download.mql5.com/cdn/web/metaquotes.software.corp/mt5/mt5setup.exe     -O /tmp/mt5setup.exe     && echo 'mt5setup.exe downloaded'

WORKDIR /app
COPY bridge.py /app/bridge.py
COPY bridge_mock.py /app/bridge_mock.py
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# NOTE: Wine prefix is initialized at container RUNTIME (needs DISPLAY)
# Docker build --privileged is not needed; runtime --privileged is required
CMD ["/app/entrypoint.sh"]
