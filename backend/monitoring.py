"""Health monitoring and metrics endpoint"""
from fastapi import APIRouter
from typing import Dict, List
from datetime import datetime, timedelta
from database import load_data
from config import settings
from logger import logger

router = APIRouter(prefix="/api/monitoring", tags=["monitoring"])

@router.get("/metrics")
async def get_metrics() -> Dict:
    """Get application metrics for monitoring"""
    try:
        appointments = load_data("appointments")
        patients = load_data("patient_states")
        reviews = load_data("reviews")
        profiles = load_data("profiles")
        
        # Time-based metrics
        now = datetime.now()
        today = now.date().isoformat()
        week_ago = (now - timedelta(days=7)).isoformat()
        month_ago = (now - timedelta(days=30)).isoformat()
        
        # Appointment metrics
        today_appointments = [a for a in appointments if a.get("date") == today]
        week_appointments = [a for a in appointments if a.get("createdAt", "") >= week_ago]
        month_appointments = [a for a in appointments if a.get("createdAt", "") >= month_ago]
        
        # Status distribution
        status_counts = {}
        for status in ["reviewing", "contacted", "completed", "cancelled"]:
            status_counts[status] = len([a for a in appointments if a.get("status") == status])
        
        # Type distribution
        type_counts = {
            "free": len([a for a in appointments if a.get("type") == "free"]),
            "paid": len([a for a in appointments if a.get("type") == "paid"])
        }
        
        # Review metrics
        avg_rating = sum(r.get("rating", 0) for r in reviews) / len(reviews) if reviews else 0
        
        # Active users (last 7 days)
        active_users = len([
            p for p in profiles 
            if p.get("lastActive", "") >= week_ago
        ])
        
        return {
            "timestamp": now.isoformat(),
            "appointments": {
                "total": len(appointments),
                "today": len(today_appointments),
                "this_week": len(week_appointments),
                "this_month": len(month_appointments),
                "by_status": status_counts,
                "by_type": type_counts
            },
            "patients": {
                "total": len(patients),
                "profiles": len(profiles),
                "active_week": active_users
            },
            "reviews": {
                "total": len(reviews),
                "average_rating": round(avg_rating, 2),
                "verified": len([r for r in reviews if r.get("verified")])
            },
            "system": {
                "uptime_hours": "N/A",  # Would need process start time
                "storage_type": "database" if settings.USE_DATABASE else "json",
                "debug_mode": settings.DEBUG
            }
        }
    except Exception as e:
        logger.error(f"Error getting metrics: {e}")
        return {"error": str(e)}

@router.get("/logs")
async def get_recent_logs(limit: int = 100) -> Dict:
    """Get recent application logs (if available)"""
    # This would read from log files in production
    return {
        "message": "Log viewing not implemented",
        "suggestion": "Configure external logging service (e.g., CloudWatch, Datadog)"
    }

@router.get("/websocket/stats")
async def get_websocket_stats() -> Dict:
    """Get WebSocket connection statistics"""
    from main import manager
    
    total_connections = sum(len(conns) for conns in manager.active_connections.values())
    
    date_stats = {
        date_str: len(conns)
        for date_str, conns in manager.active_connections.items()
    }
    
    return {
        "total_connections": total_connections,
        "active_dates": len(manager.active_connections),
        "connections_by_date": date_stats,
        "timestamp": datetime.now().isoformat()
    }
