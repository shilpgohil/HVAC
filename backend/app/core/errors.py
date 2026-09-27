from fastapi import HTTPException, status


class DomainException(HTTPException):
    def __init__(self, status_code: int, detail: str, code: str):
        super().__init__(status_code=status_code, detail={"message": detail, "code": code})
        self.code = code


class EntityNotFoundError(DomainException):
    def __init__(self, entity_type: str, entity_id: str):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{entity_type} with ID '{entity_id}' was not found.",
            code="ENTITY_NOT_FOUND"
        )


class SafetyInterlockViolationError(DomainException):
    def __init__(self, reason: str):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Safety interlock violated: {reason}",
            code="SAFETY_INTERLOCK_VIOLATION"
        )


class CommandTimeoutError(DomainException):
    def __init__(self, command_id: str, timeout_seconds: int):
        super().__init__(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail=f"Command '{command_id}' timed out waiting for physical state confirmation after {timeout_seconds} seconds.",
            code="COMMAND_CONFIRMATION_TIMEOUT"
        )


class UnauthorizedControlActionError(DomainException):
    def __init__(self, action: str, required_role: str):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Action '{action}' requires '{required_role}' authorization.",
            code="UNAUTHORIZED_CONTROL_ACTION"
        )
