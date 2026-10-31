import ipaddress
import socket
from urllib.parse import urlparse
from typing import Tuple

# Disallowed IP networks
BLOCKED_NETWORKS = [
    ipaddress.ip_network("0.0.0.0/8"),          # Current network (only valid as source address)
    ipaddress.ip_network("10.0.0.0/8"),         # RFC 1918 Private-Use
    ipaddress.ip_network("100.64.0.0/10"),      # Shared Address Space
    ipaddress.ip_network("127.0.0.0/8"),        # Loopback
    ipaddress.ip_network("169.254.0.0/16"),     # Link Local & Cloud Metadata (169.254.169.254)
    ipaddress.ip_network("172.16.0.0/12"),      # RFC 1918 Private-Use
    ipaddress.ip_network("192.0.0.0/24"),       # IETF Protocol Assignments
    ipaddress.ip_network("192.0.2.0/24"),       # TEST-NET-1
    ipaddress.ip_network("192.168.0.0/16"),     # RFC 1918 Private-Use
    ipaddress.ip_network("198.18.0.0/15"),      # Network Interconnect Device Benchmark
    ipaddress.ip_network("198.51.100.0/24"),    # TEST-NET-2
    ipaddress.ip_network("203.0.113.0/24"),     # TEST-NET-3
    ipaddress.ip_network("224.0.0.0/4"),        # Multicast
    ipaddress.ip_network("240.0.0.0/4"),        # Reserved
    ipaddress.ip_network("255.255.255.255/32"), # Broadcast
    # IPv6 ranges
    ipaddress.ip_network("::1/128"),            # Loopback
    ipaddress.ip_network("::/128"),             # Unspecified
    ipaddress.ip_network("fc00::/7"),           # Unique Local Address (ULA)
    ipaddress.ip_network("fe80::/10"),          # Link-Local
]

def is_ip_blocked(ip_str: str) -> bool:
    try:
        ip = ipaddress.ip_address(ip_str)
        for net in BLOCKED_NETWORKS:
            if ip in net:
                return True
        return False
    except ValueError:
        return True

def validate_url_security(url: str) -> Tuple[bool, str]:
    try:
        parsed = urlparse(url)
        if not parsed.scheme or parsed.scheme.lower() not in ["http", "https"]:
            return False, f"Unsupported or dangerous URL scheme: {parsed.scheme}"

        hostname = parsed.hostname
        if not hostname:
            return False, "Invalid URL: Missing hostname"

        # Explicitly block known cloud metadata hostnames
        if hostname.lower() in ["metadata.google.internal", "metadata", "instance-data"]:
            return False, "Access to cloud metadata endpoints is prohibited"

        # Check if the hostname itself is an IP literal
        try:
            ip = ipaddress.ip_address(hostname)
            if is_ip_blocked(str(ip)):
                return False, f"Direct access to restricted or private IP address {hostname} is blocked"
            return True, "Valid IP address"
        except ValueError:
            pass

        # Resolve hostname via DNS to prevent DNS rebinding to internal networks
        try:
            addr_info = socket.getaddrinfo(hostname, None)
            resolved_ips = [info[4][0] for info in addr_info]
            if not resolved_ips:
                return False, f"Could not resolve domain: {hostname}"

            for ip_str in resolved_ips:
                if is_ip_blocked(ip_str):
                    return False, f"SSRF Protection: Hostname '{hostname}' resolves to restricted internal IP {ip_str}"

            return True, "Safe URL"
        except socket.gaierror:
            return False, f"DNS resolution failed for hostname '{hostname}'"
        except Exception as e:
            return False, f"DNS verification error: {str(e)}"

    except Exception as e:
        return False, f"Malformed URL: {str(e)}"
