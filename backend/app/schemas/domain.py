from datetime import datetime
from typing import Optional, Dict, Any, List
from enum import Enum
from pydantic import BaseModel, ConfigDict, Field


class DataQuality(str, Enum):
    GOOD = "GOOD"
    UNCERTAIN = "UNCERTAIN"
    STALE = "STALE"
    BAD = "BAD"
    DISCONNECTED = "DISCONNECTED"
    UNKNOWN = "UNKNOWN"


class EquipmentState(str, Enum):
    NORMAL = "NORMAL"
    RUNNING = "RUNNING"
    STOPPED = "STOPPED"
    STARTING = "STARTING"
    STOPPING = "STOPPING"
    WARNING = "WARNING"
    FAULT = "FAULT"
    OFFLINE = "OFFLINE"
    UNKNOWN = "UNKNOWN"


class ControlMode(str, Enum):
    AUTO = "AUTO"
    MANUAL = "MANUAL"
    REMOTE = "REMOTE"
    LOCAL = "LOCAL"
    LOCKED = "LOCKED"
    OFF = "OFF"


class AlarmSeverity(str, Enum):
    INFO = "INFO"
    WARNING = "WARNING"
    CRITICAL = "CRITICAL"
    EMERGENCY = "EMERGENCY"


class AlarmState(str, Enum):
    ACTIVE = "ACTIVE"
    ACKNOWLEDGED = "ACKNOWLEDGED"
    CLEARED = "CLEARED"


class CommandStatus(str, Enum):
    SENT = "SENT"
    ACK_BY_GATEWAY = "ACK_BY_GATEWAY"
    WAITING_FOR_CONFIRMATION = "WAITING_FOR_CONFIRMATION"
    CONFIRMED = "CONFIRMED"
    TIMED_OUT = "TIMED_OUT"
    FAILED = "FAILED"
    REJECTED = "REJECTED"


class VisualConfigSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    canvas_x: float
    canvas_y: float
    width: float
    height: float
    rotation_deg: float = 0.0
    layer_index: int = 1
    render_symbol: str
    svg_metadata: Dict[str, Any] = Field(default_factory=dict)


class PointCurrentStateSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    value: Optional[float] = None
    raw_value: Optional[str] = None
    quality: DataQuality = DataQuality.UNKNOWN
    timestamp: datetime


class PointSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    component_id: str
    code: str
    name: str
    point_type: str
    engineering_unit: str
    display_unit: str
    precision_digits: int = 1
    min_value: Optional[float] = None
    max_value: Optional[float] = None
    is_writable: bool = False
    stale_threshold_seconds: int = 30
    current_state: Optional[PointCurrentStateSchema] = None


class ComponentSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    system_id: str
    parent_id: Optional[str] = None
    code: str
    name: str
    component_type: str
    manufacturer: Optional[str] = None
    model_number: Optional[str] = None
    serial_number: Optional[str] = None
    rated_capacity: Optional[float] = None
    capacity_unit: Optional[str] = None
    is_active: bool = True
    metadata_json: Dict[str, Any] = Field(default_factory=dict)
    visual_config: Optional[VisualConfigSchema] = None
    points: List[PointSchema] = Field(default_factory=list)


class ComponentRelationshipSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    system_id: str
    source_component_id: str
    target_component_id: str
    medium: str
    flow_direction: str = "forward"
    metadata_json: Dict[str, Any] = Field(default_factory=dict)


class AlarmSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    component_id: str
    point_id: Optional[str] = None
    severity: AlarmSeverity
    state: AlarmState
    condition: str
    message: str
    trigger_value: Optional[float] = None
    threshold_value: Optional[float] = None
    triggered_at: datetime
    acknowledged_by: Optional[str] = None
    acknowledged_at: Optional[datetime] = None
    cleared_at: Optional[datetime] = None
    notes: Optional[str] = None


class AlarmAcknowledgeRequest(BaseModel):
    acknowledged_by: str
    notes: Optional[str] = None


class SupervisoryCommandRequest(BaseModel):
    component_id: str
    point_id: str
    command_type: str
    requested_value: float
    requested_by: str


class SupervisoryCommandResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    component_id: str
    point_id: str
    command_type: str
    requested_value: float
    previous_value: Optional[float] = None
    requested_by: str
    requested_at: datetime
    status: CommandStatus
    confirmed_at: Optional[datetime] = None
    failure_reason: Optional[str] = None


class SimulatorScenarioResponse(BaseModel):
    scenario_id: int
    name: str
    description: str
    active: bool


class FacilityOverviewResponse(BaseModel):
    site_code: str
    site_name: str
    overall_health: str
    plc_connected: bool
    plc_latency_ms: float
    active_alarms_count: int
    critical_alarms_count: int
    total_power_kw: float
    total_airflow_cfm: float
    average_zone_temp_c: float
    hepa_filter_dp_pa: float
    economizer_mode: str
    operating_scenario_id: int
    operating_scenario_name: str
