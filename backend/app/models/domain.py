import uuid
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from sqlalchemy import String, Numeric, Boolean, Integer, Text, ForeignKey, DateTime, JSON
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Base(DeclarativeBase):
    pass


class Site(Base):
    __tablename__ = "sites"
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    code: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    timezone: Mapped[str] = mapped_column(String(64), default="UTC", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    
    buildings: Mapped[list["Building"]] = relationship("Building", back_populates="site", cascade="all, delete-orphan")


class Building(Base):
    __tablename__ = "buildings"
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    site_id: Mapped[str] = mapped_column(String(36), ForeignKey("sites.id", ondelete="CASCADE"), nullable=False)
    code: Mapped[str] = mapped_column(String(64), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    total_area_sqm: Mapped[Optional[float]] = mapped_column(Numeric(10, 2), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    
    site: Mapped["Site"] = relationship("Site", back_populates="buildings")
    systems: Mapped[list["HvacSystem"]] = relationship("HvacSystem", back_populates="building", cascade="all, delete-orphan")


class HvacSystem(Base):
    __tablename__ = "hvac_systems"
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    building_id: Mapped[str] = mapped_column(String(36), ForeignKey("buildings.id", ondelete="CASCADE"), nullable=False)
    code: Mapped[str] = mapped_column(String(64), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    system_type: Mapped[str] = mapped_column(String(64), nullable=False)
    design_capacity_kw: Mapped[Optional[float]] = mapped_column(Numeric(12, 2), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    
    building: Mapped["Building"] = relationship("Building", back_populates="systems")
    components: Mapped[list["Component"]] = relationship("Component", back_populates="system", cascade="all, delete-orphan")


class Component(Base):
    __tablename__ = "components"
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    system_id: Mapped[str] = mapped_column(String(36), ForeignKey("hvac_systems.id", ondelete="CASCADE"), nullable=False)
    parent_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("components.id", ondelete="CASCADE"), nullable=True)
    code: Mapped[str] = mapped_column(String(64), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    component_type: Mapped[str] = mapped_column(String(64), nullable=False)
    manufacturer: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    model_number: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    serial_number: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    rated_capacity: Mapped[Optional[float]] = mapped_column(Numeric(12, 2), nullable=True)
    capacity_unit: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    metadata_json: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    
    system: Mapped["HvacSystem"] = relationship("HvacSystem", back_populates="components")
    parent: Mapped[Optional["Component"]] = relationship("Component", remote_side=[id], backref="children")
    points: Mapped[list["Point"]] = relationship("Point", back_populates="component", cascade="all, delete-orphan")
    visual_config: Mapped[Optional["VisualConfig"]] = relationship("VisualConfig", back_populates="component", uselist=False, cascade="all, delete-orphan")
    alarms: Mapped[list["Alarm"]] = relationship("Alarm", back_populates="component", cascade="all, delete-orphan")


class ComponentRelationship(Base):
    __tablename__ = "component_relationships"
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    system_id: Mapped[str] = mapped_column(String(36), ForeignKey("hvac_systems.id", ondelete="CASCADE"), nullable=False)
    source_component_id: Mapped[str] = mapped_column(String(36), ForeignKey("components.id", ondelete="CASCADE"), nullable=False)
    target_component_id: Mapped[str] = mapped_column(String(36), ForeignKey("components.id", ondelete="CASCADE"), nullable=False)
    medium: Mapped[str] = mapped_column(String(32), nullable=False)
    flow_direction: Mapped[str] = mapped_column(String(16), default="forward", nullable=False)
    metadata_json: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)


class VisualConfig(Base):
    __tablename__ = "visual_configs"
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    component_id: Mapped[str] = mapped_column(String(36), ForeignKey("components.id", ondelete="CASCADE"), unique=True, nullable=False)
    canvas_x: Mapped[float] = mapped_column(Numeric(8, 2), nullable=False)
    canvas_y: Mapped[float] = mapped_column(Numeric(8, 2), nullable=False)
    width: Mapped[float] = mapped_column(Numeric(8, 2), nullable=False)
    height: Mapped[float] = mapped_column(Numeric(8, 2), nullable=False)
    rotation_deg: Mapped[float] = mapped_column(Numeric(5, 2), default=0.0, nullable=False)
    layer_index: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    render_symbol: Mapped[str] = mapped_column(String(64), nullable=False)
    svg_metadata: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    
    component: Mapped["Component"] = relationship("Component", back_populates="visual_config")


class Point(Base):
    __tablename__ = "points"
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    component_id: Mapped[str] = mapped_column(String(36), ForeignKey("components.id", ondelete="CASCADE"), nullable=False)
    code: Mapped[str] = mapped_column(String(64), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    point_type: Mapped[str] = mapped_column(String(32), nullable=False)
    engineering_unit: Mapped[str] = mapped_column(String(32), nullable=False)
    display_unit: Mapped[str] = mapped_column(String(32), nullable=False)
    precision_digits: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    min_value: Mapped[Optional[float]] = mapped_column(Numeric(12, 2), nullable=True)
    max_value: Mapped[Optional[float]] = mapped_column(Numeric(12, 2), nullable=True)
    is_writable: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    stale_threshold_seconds: Mapped[int] = mapped_column(Integer, default=30, nullable=False)
    source_protocol: Mapped[str] = mapped_column(String(32), default="simulation", nullable=False)
    source_address: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    
    component: Mapped["Component"] = relationship("Component", back_populates="points")
    current_state: Mapped[Optional["CurrentPointState"]] = relationship("CurrentPointState", back_populates="point", uselist=False, cascade="all, delete-orphan")


class CurrentPointState(Base):
    __tablename__ = "current_point_state"
    
    point_id: Mapped[str] = mapped_column(String(36), ForeignKey("points.id", ondelete="CASCADE"), primary_key=True)
    value: Mapped[Optional[float]] = mapped_column(Numeric(14, 4), nullable=True)
    raw_value: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    quality: Mapped[str] = mapped_column(String(32), default="UNKNOWN", nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    
    point: Mapped["Point"] = relationship("Point", back_populates="current_state")


class TelemetryHistory(Base):
    __tablename__ = "telemetry_history"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    point_id: Mapped[str] = mapped_column(String(36), ForeignKey("points.id", ondelete="CASCADE"), nullable=False, index=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    value: Mapped[float] = mapped_column(Numeric(14, 4), nullable=False)
    quality: Mapped[str] = mapped_column(String(32), nullable=False)


class Alarm(Base):
    __tablename__ = "alarms"
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    component_id: Mapped[str] = mapped_column(String(36), ForeignKey("components.id", ondelete="CASCADE"), nullable=False)
    point_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("points.id", ondelete="SET NULL"), nullable=True)
    severity: Mapped[str] = mapped_column(String(16), nullable=False)
    state: Mapped[str] = mapped_column(String(16), default="ACTIVE", nullable=False)
    condition: Mapped[str] = mapped_column(String(128), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    trigger_value: Mapped[Optional[float]] = mapped_column(Numeric(14, 4), nullable=True)
    threshold_value: Mapped[Optional[float]] = mapped_column(Numeric(14, 4), nullable=True)
    triggered_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    acknowledged_by: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    acknowledged_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    cleared_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    component: Mapped["Component"] = relationship("Component", back_populates="alarms")


class SupervisoryCommand(Base):
    __tablename__ = "supervisory_commands"
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    component_id: Mapped[str] = mapped_column(String(36), ForeignKey("components.id", ondelete="CASCADE"), nullable=False)
    point_id: Mapped[str] = mapped_column(String(36), ForeignKey("points.id", ondelete="CASCADE"), nullable=False)
    command_type: Mapped[str] = mapped_column(String(64), nullable=False)
    requested_value: Mapped[float] = mapped_column(Numeric(14, 4), nullable=False)
    previous_value: Mapped[Optional[float]] = mapped_column(Numeric(14, 4), nullable=True)
    requested_by: Mapped[str] = mapped_column(String(128), nullable=False)
    requested_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="SENT", nullable=False)
    confirmed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    failure_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
