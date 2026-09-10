# Report Access by Role

This document tracks which reports each role is allowed to view in Lantern. Source: Soujanya Puvvalla, 2026-09-10.

| Report List | Finance Manager | Project Manager | Delivery & Operations Manager | Super User | Admin |
|---|---|---|---|---|---|
| Resource Utilization (Without Cost) | | X | | | X |
| Resource Utilization | | X | X | X | X |
| Revenue & Target Tracking | X | | X | X | X |
| Timesheets & Invoice Tracking | X | | X | X | X |
| Contracts & Agreements Tracking | | | X | X | X |
| Status Updates | | X | X | X | X |
| Project Budget Tracking | | | X | X | X |

## Notes

- "Resource Utilization (Without Cost)" is a cost-redacted variant of "Resource Utilization", visible to Project Manager and Admin only.
- Finance Manager has the narrowest access: financial/invoice-related reports only.
- Super User and Admin have identical access in this table, except Admin also sees "Resource Utilization (Without Cost)".
- Update this table if role permissions change; it should stay in sync with the actual report access-control implementation once built.
