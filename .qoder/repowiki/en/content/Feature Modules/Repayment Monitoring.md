# Repayment Monitoring

<cite>
**Referenced Files in This Document**
- [Repayments.tsx](file://src/pages/Repayments.tsx)
- [repayments.ts](file://src/data/repayments.ts)
- [loans.ts](file://src/data/loans.ts)
- [members.ts](file://src/data/members.ts)
- [StatusBadge.tsx](file://src/components/StatusBadge.tsx)
- [StatCard.tsx](file://src/components/StatCard.tsx)
- [Dashboard.tsx](file://src/pages/Dashboard.tsx)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)

## Introduction
This document provides comprehensive documentation for the Repayment Monitoring module. It covers due date tracking, payment recording, overdue management, and repayment history functionality. The module enables administrators to monitor EMI payments, track due collections, manage repayment schedules, and gain insights through analytics and status indicators. It integrates with the loan management system to associate repayments with specific loans and members, and provides visual indicators for payment status including on-time, overdue, and pending states.

## Project Structure
The Repayment Monitoring module is organized around three primary areas:
- Data layer: Defines the repayment data model and helper functions for filtering and aggregation.
- UI layer: Provides the Repayments page with statistics cards, repayment history table, and status badges.
- Integration layer: Connects repayments to loans and members for enriched display and analytics.

```mermaid
graph TB
subgraph "Data Layer"
RD["repayments.ts<br/>Defines Repayment model and helpers"]
LD["loans.ts<br/>Defines Loan model and helpers"]
MD["members.ts<br/>Defines Member model"]
end
subgraph "UI Layer"
RP["Repayments.tsx<br/>Repayments page interface"]
SB["StatusBadge.tsx<br/>Status indicators"]
SC["StatCard.tsx<br/>Analytics cards"]
end
subgraph "Integration"
DB["Dashboard.tsx<br/>Recent repayments summary"]
end
RD --> RP
LD --> RP
MD --> RP
RP --> SB
RP --> SC
RP --> DB
```

**Diagram sources**
- [repayments.ts](file://src/data/repayments.ts#L1-L71)
- [loans.ts](file://src/data/loans.ts#L1-L140)
- [members.ts](file://src/data/members.ts#L1-L122)
- [Repayments.tsx](file://src/pages/Repayments.tsx#L1-L141)
- [StatusBadge.tsx](file://src/components/StatusBadge.tsx#L1-L37)
- [StatCard.tsx](file://src/components/StatCard.tsx#L1-L73)
- [Dashboard.tsx](file://src/pages/Dashboard.tsx#L133-L189)

**Section sources**
- [Repayments.tsx](file://src/pages/Repayments.tsx#L1-L141)
- [repayments.ts](file://src/data/repayments.ts#L1-L71)
- [loans.ts](file://src/data/loans.ts#L1-L140)
- [members.ts](file://src/data/members.ts#L1-L122)
- [StatusBadge.tsx](file://src/components/StatusBadge.tsx#L1-L37)
- [StatCard.tsx](file://src/components/StatCard.tsx#L1-L73)
- [Dashboard.tsx](file://src/pages/Dashboard.tsx#L133-L189)

## Core Components
This section outlines the core components that implement the Repayment Monitoring functionality.

- Repayment data model
  - Fields include repayment identifiers, associated loan identifier, due date, payment date, amount paid, remaining balance, penalty, and status.
  - Status values are constrained to Paid, Pending, or Overdue.

- Repayment helpers
  - Filtering helpers for overdue and pending repayments.
  - Aggregation helper to compute total collected across all paid repayments.

- Repayments page
  - Displays four key statistics: Total Collected, Paid This Month, Pending, and Overdue.
  - Renders a comprehensive table of all repayments with member and loan associations, due dates, payment dates, amounts, balances, penalties, and status indicators.

- Status indicators
  - A reusable component that renders status badges with appropriate styles for Paid, Pending, Overdue, Active, Completed, and Defaulted states.

- Analytics cards
  - A reusable component that displays key metrics with icons, labels, and optional trend indicators.

- Dashboard integration
  - The dashboard page surfaces recent repayments, highlighting overdue and pending items for quick oversight.

**Section sources**
- [repayments.ts](file://src/data/repayments.ts#L1-L10)
- [repayments.ts](file://src/data/repayments.ts#L52-L71)
- [Repayments.tsx](file://src/pages/Repayments.tsx#L20-L65)
- [Repayments.tsx](file://src/pages/Repayments.tsx#L88-L133)
- [StatusBadge.tsx](file://src/components/StatusBadge.tsx#L3-L23)
- [StatCard.tsx](file://src/components/StatCard.tsx#L4-L14)
- [Dashboard.tsx](file://src/pages/Dashboard.tsx#L150-L186)

## Architecture Overview
The Repayment Monitoring module follows a layered architecture:
- Data layer encapsulates the repayment domain model and provides helper functions for filtering and aggregation.
- Integration layer connects repayments to loans and members to enrich display and enable cross-entity analytics.
- UI layer renders statistics, repayment history, and status indicators with reusable components for consistency and maintainability.

```mermaid
graph TB
subgraph "Data Layer"
RM["Repayment Model<br/>repayments.ts"]
LM["Loan Model<br/>loans.ts"]
MM["Member Model<br/>members.ts"]
RH["Repayment Helpers<br/>repayments.ts"]
end
subgraph "Integration Layer"
INT["Repayments → Loans → Members<br/>Repayments.tsx"]
end
subgraph "UI Layer"
RP["Repayments Page<br/>Repayments.tsx"]
SB["StatusBadge Component<br/>StatusBadge.tsx"]
SC["StatCard Component<br/>StatCard.tsx"]
DB["Dashboard Integration<br/>Dashboard.tsx"]
end
RM --> RH
LM --> INT
MM --> INT
RH --> RP
INT --> RP
SB --> RP
SC --> RP
RP --> DB
```

**Diagram sources**
- [repayments.ts](file://src/data/repayments.ts#L1-L71)
- [loans.ts](file://src/data/loans.ts#L1-L140)
- [members.ts](file://src/data/members.ts#L1-L122)
- [Repayments.tsx](file://src/pages/Repayments.tsx#L88-L133)
- [StatusBadge.tsx](file://src/components/StatusBadge.tsx#L1-L37)
- [StatCard.tsx](file://src/components/StatCard.tsx#L1-L73)
- [Dashboard.tsx](file://src/pages/Dashboard.tsx#L150-L186)

**Section sources**
- [repayments.ts](file://src/data/repayments.ts#L1-L71)
- [loans.ts](file://src/data/loans.ts#L1-L140)
- [members.ts](file://src/data/members.ts#L1-L122)
- [Repayments.tsx](file://src/pages/Repayments.tsx#L88-L133)
- [StatusBadge.tsx](file://src/components/StatusBadge.tsx#L1-L37)
- [StatCard.tsx](file://src/components/StatCard.tsx#L1-L73)
- [Dashboard.tsx](file://src/pages/Dashboard.tsx#L150-L186)

## Detailed Component Analysis

### Repayment Data Model
The repayment data model defines the structure for storing and retrieving repayment records. It includes:
- Unique repayment identifiers
- Associated loan identifiers
- Due date and optional payment date
- Amount paid and remaining balance
- Penalty amount
- Status field constrained to Paid, Pending, or Overdue

```mermaid
classDiagram
class Repayment {
+string repayment_id
+string loan_id
+string due_date
+string|nil payment_date
+number amount_paid
+number remaining_balance
+number penalty
+"Paid"|"Pending"|"Overdue"| status
}
class Loan {
+string loan_id
+string member_id
+number loan_amount
+number interest_rate
+number tenure
+number emi
+string purpose
+string start_date
+"Active"|"Completed"|"Defaulted"| status
+number total_paid
}
class Member {
+string member_id
+string name
+number age
+string village
+string phone
+number income
+string join_date
}
Repayment --> Loan : "associated via loan_id"
Loan --> Member : "associated via member_id"
```

**Diagram sources**
- [repayments.ts](file://src/data/repayments.ts#L1-L10)
- [loans.ts](file://src/data/loans.ts#L1-L12)
- [members.ts](file://src/data/members.ts#L1-L10)

**Section sources**
- [repayments.ts](file://src/data/repayments.ts#L1-L10)
- [loans.ts](file://src/data/loans.ts#L1-L12)
- [members.ts](file://src/data/members.ts#L1-L10)

### Repayment Tracking System
The Repayment Tracking System manages the lifecycle of repayment records:
- Due date tracking: Each repayment record stores a due date and an optional payment date.
- Payment recording: When a payment is made, the payment date is recorded, amount paid is updated, and the remaining balance is recalculated.
- Status updates: Status transitions from Pending to Paid upon successful payment; overdue status is determined by comparing due dates with current date.

```mermaid
flowchart TD
Start(["Repayment Record Created"]) --> SetDueDate["Set Due Date"]
SetDueDate --> Pending["Status: Pending"]
Pending --> PaymentMade{"Payment Received?"}
PaymentMade --> |No| OverdueCheck["Check Overdue vs Current Date"]
OverdueCheck --> Overdue["Status: Overdue"]
OverdueCheck --> Pending
PaymentMade --> |Yes| RecordPayment["Record Payment Date<br/>Update Amount Paid<br/>Update Remaining Balance"]
RecordPayment --> Paid["Status: Paid"]
Paid --> End(["End"])
Overdue --> End
```

**Diagram sources**
- [repayments.ts](file://src/data/repayments.ts#L1-L10)
- [repayments.ts](file://src/data/repayments.ts#L52-L71)

**Section sources**
- [repayments.ts](file://src/data/repayments.ts#L1-L10)
- [repayments.ts](file://src/data/repayments.ts#L52-L71)

### Repayment History Table
The Repayment History Table presents a comprehensive view of repayment records:
- Columns include Repayment ID, Member, Loan ID, Due Date, Payment Date, Amount, Balance, Penalty, and Status.
- Member information is derived from the associated loan and member records.
- Overdue rows are visually highlighted for quick identification.

```mermaid
sequenceDiagram
participant U as "User"
participant P as "Repayments Page"
participant D as "Data Layer"
participant L as "Loans"
participant M as "Members"
U->>P : Open Repayments Page
P->>D : Request Repayment Records
D-->>P : Repayment Records
loop For each repayment
P->>L : Find Loan by loan_id
L-->>P : Loan Details
P->>M : Find Member by member_id
M-->>P : Member Details
P->>P : Render Row with Member Avatar, Loan ID, Dates, Amounts, Penalty, Status
end
P-->>U : Display Repayment History Table
```

**Diagram sources**
- [Repayments.tsx](file://src/pages/Repayments.tsx#L88-L133)
- [loans.ts](file://src/data/loans.ts#L120-L123)
- [members.ts](file://src/data/members.ts#L12-L121)

**Section sources**
- [Repayments.tsx](file://src/pages/Repayments.tsx#L88-L133)
- [loans.ts](file://src/data/loans.ts#L120-L123)
- [members.ts](file://src/data/members.ts#L12-L121)

### Status Management and Visual Indicators
Status badges provide immediate visual feedback on repayment status:
- Paid: Indicates on-time or early payment.
- Pending: Indicates upcoming due date without payment.
- Overdue: Indicates missed or late payment.

```mermaid
classDiagram
class StatusBadge {
+status : "Paid"|"Pending"|"Overdue"|"Active"|"Completed"|"Defaulted"
+render() string
}
class Repayment {
+status : "Paid"|"Pending"|"Overdue"
}
StatusBadge --> Repayment : "displays status"
```

**Diagram sources**
- [StatusBadge.tsx](file://src/components/StatusBadge.tsx#L3-L23)
- [repayments.ts](file://src/data/repayments.ts#L8-L9)

**Section sources**
- [StatusBadge.tsx](file://src/components/StatusBadge.tsx#L3-L23)
- [repayments.ts](file://src/data/repayments.ts#L8-L9)

### Analytics and Metrics
The Repayments page includes four key analytics cards:
- Total Collected: Sum of all amounts paid across Paid repayments.
- Paid This Month: Count of repayments marked as Paid.
- Pending: Count of repayments marked as Pending.
- Overdue: Count of repayments marked as Overdue.

These metrics are computed using helper functions and displayed using the StatCard component.

```mermaid
sequenceDiagram
participant P as "Repayments Page"
participant H as "Helpers"
participant C as "StatCard Component"
P->>H : getTotalCollected()
H-->>P : Total Collected Value
P->>H : getRepaymentsByLoan(loanId)
H-->>P : Repayments for Loan
P->>H : getOverdueRepayments()
H-->>P : Overdue Repayments
P->>H : getPendingRepayments()
H-->>P : Pending Repayments
P->>C : Render Stat Cards with Values and Icons
C-->>P : Rendered Cards
```

**Diagram sources**
- [Repayments.tsx](file://src/pages/Repayments.tsx#L20-L24)
- [repayments.ts](file://src/data/repayments.ts#L52-L71)
- [StatCard.tsx](file://src/components/StatCard.tsx#L32-L72)

**Section sources**
- [Repayments.tsx](file://src/pages/Repayments.tsx#L20-L24)
- [repayments.ts](file://src/data/repayments.ts#L52-L71)
- [StatCard.tsx](file://src/components/StatCard.tsx#L32-L72)

### Dashboard Integration
The dashboard page includes a "Recent Repayments" section that highlights overdue and pending items, enabling quick oversight and follow-up actions.

```mermaid
sequenceDiagram
participant DB as "Dashboard"
participant H as "Helpers"
participant T as "Table"
DB->>H : getOverdueRepayments()
H-->>DB : Overdue Repayments
DB->>H : getPendingRepayments()
H-->>DB : Pending Repayments
DB->>T : Render Recent Repayments Table
T-->>DB : Rendered Table
```

**Diagram sources**
- [Dashboard.tsx](file://src/pages/Dashboard.tsx#L150-L186)
- [repayments.ts](file://src/data/repayments.ts#L57-L65)

**Section sources**
- [Dashboard.tsx](file://src/pages/Dashboard.tsx#L150-L186)
- [repayments.ts](file://src/data/repayments.ts#L57-L65)

## Dependency Analysis
The Repayment Monitoring module exhibits clear separation of concerns:
- The Repayments page depends on the data layer for repayment records and on the integration layer for loan and member associations.
- The StatusBadge and StatCard components are reusable and support consistent UI across the application.
- The dashboard integrates recent repayment data to provide a high-level overview.

```mermaid
graph TB
RP["Repayments.tsx"] --> RT["repayments.ts"]
RP --> LT["loans.ts"]
RP --> MT["members.ts"]
RP --> SB["StatusBadge.tsx"]
RP --> SC["StatCard.tsx"]
DB["Dashboard.tsx"] --> RT
DB --> LT
```

**Diagram sources**
- [Repayments.tsx](file://src/pages/Repayments.tsx#L14-L18)
- [repayments.ts](file://src/data/repayments.ts#L1-L71)
- [loans.ts](file://src/data/loans.ts#L1-L140)
- [members.ts](file://src/data/members.ts#L1-L122)
- [StatusBadge.tsx](file://src/components/StatusBadge.tsx#L1-L37)
- [StatCard.tsx](file://src/components/StatCard.tsx#L1-L73)
- [Dashboard.tsx](file://src/pages/Dashboard.tsx#L150-L186)

**Section sources**
- [Repayments.tsx](file://src/pages/Repayments.tsx#L14-L18)
- [repayments.ts](file://src/data/repayments.ts#L1-L71)
- [loans.ts](file://src/data/loans.ts#L1-L140)
- [members.ts](file://src/data/members.ts#L1-L122)
- [StatusBadge.tsx](file://src/components/StatusBadge.tsx#L1-L37)
- [StatCard.tsx](file://src/components/StatCard.tsx#L1-L73)
- [Dashboard.tsx](file://src/pages/Dashboard.tsx#L150-L186)

## Performance Considerations
- Data filtering and aggregation: The helper functions filter and reduce arrays client-side. For larger datasets, consider server-side filtering and pagination.
- Rendering efficiency: The repayment table iterates through all repayment records. Virtualization or lazy loading can improve rendering performance for large lists.
- Status rendering: Reusable components minimize redundant logic and improve maintainability.

## Troubleshooting Guide
- Repayment status discrepancies
  - Verify due dates and payment dates in the repayment records.
  - Confirm helper functions are correctly filtering overdue and pending statuses.

- Missing member or loan information
  - Ensure loan and member records exist and match the identifiers in repayment records.
  - Check for typos in loan_id or member_id fields.

- Dashboard recent repayments not updating
  - Confirm helper functions are returning the expected counts for overdue and pending repayments.
  - Verify the dashboard integration is using the correct helper functions.

**Section sources**
- [repayments.ts](file://src/data/repayments.ts#L52-L71)
- [loans.ts](file://src/data/loans.ts#L120-L123)
- [members.ts](file://src/data/members.ts#L12-L121)
- [Dashboard.tsx](file://src/pages/Dashboard.tsx#L150-L186)

## Conclusion
The Repayment Monitoring module provides a robust foundation for tracking loan payments, managing overdue collections, and delivering actionable insights through analytics. Its modular design, clear data models, and reusable UI components facilitate maintainability and scalability. Future enhancements could include automated due date reminders, payment validation workflows, late fee calculations, and recovery procedures to further strengthen the repayment monitoring capabilities.