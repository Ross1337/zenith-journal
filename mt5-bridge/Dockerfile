FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive
ENV WINEARCH=win64
ENV WINEPREFIX=/root/.wine

# Install dependencies
RUN apt-get update && apt-get install -y \
    software-properties-common \
    wget \
    curl \
    gnupg2 \
    ca-certificates \
    xvfb \
    xauth \
    python3.11 \
    python3-pip \
    python3.11-venv \
    && rm -rf /var/lib/apt/lists/*

# Install Wine (winehq-stable)
RUN dpkg --add-architecture i386 \
    && mkdir -pm755 /etc/apt/keyrings \
    && wget -O /etc/apt/keyrings/winehq-archive.key https://dl.winehq.org/wine-builds/winehq.key \
    && wget -NP /etc/apt/sources.list.d/ https://dl.winehq.org/wine-builds/ubuntu/dists/jammy/winehq-jammy.sources \
    && apt-get update \
    && apt-get install -y --install-recommends winehq-stable \
    && rm -rf /var/lib/apt/lists/*

# Install Python packages (MetaTrader5 is Windows-only on PyPI; bridge.py handles ImportError gracefully)
RUN pip3 install requests

# Download MT5 installer
RUN wget -q https://download.mql5.com/cdn/web/metaquotes.software.corp/mt5/mt5setup.exe -O /tmp/mt5setup.exe

# Install winetricks + vcruntime (required for MT5 / kernel32.dll resolution)
RUN apt-get update && apt-get install -y winetricks cabextract && rm -rf /var/lib/apt/lists/*

# Init Wine prefix with vcruntime140 (fixes "could not load kernel32.dll" in headless Docker)
RUN xvfb-run --server-num=99 wineboot --init 2>/dev/null; \
    xvfb-run --server-num=99 winetricks -q vcruntime140 2>/dev/null || true

# Install MT5 silently under Wine + Xvfb
# Note: failures are non-fatal — entrypoint falls back to bridge_mock.py
RUN xvfb-run --server-num=99 --server-args="-screen 0 1024x768x16" \
    wine /tmp/mt5setup.exe /S 2>/dev/null; \
    sleep 20; \
    echo "MT5 install step complete"

WORKDIR /app
COPY bridge.py /app/bridge.py
COPY bridge_mock.py /app/bridge_mock.py
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

CMD ["/app/entrypoint.sh"]
