### Notices

| Method | Endpoint | Description | Access | Sample Body | Expected Output (Success) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/notices` | Get all active notices | Authenticated | | `200 OK` with a JSON array of notice objects. |
| **POST** | `/api/notices` | Create a new notice | Admin | `{ "title": "New Maintenance Window", "content": "There will be a maintenance window tonight from 10 PM to 11 PM." }` | `201 Created` with the newly created notice object. |
| **PUT** | `/api/notices/{noticeId}` | Update a notice | Admin | `{ "title": "Updated Maintenance Window", "content": "The maintenance window has been rescheduled to tomorrow from 10 PM to 11 PM." }` | `200 OK` with the updated notice object. |
| **DELETE** | `/api/notices/{noticeId}` | Deactivate a notice | Admin | | `200 OK` with a confirmation message or the updated object. |

### Leave

| Method | Endpoint | Description | Access | Sample Body | Expected Output (Success) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/leave` | Get all leave requests | Admin | | `200 OK` with a JSON array of leave request objects. |
| **POST** | `/api/leave` | Submit a leave request | Authenticated | `{ "startDate": "2024-08-10T00:00:00.000Z", "endDate": "2024-08-15T00:00:00.000Z", "reason": "Vacation" }` | `201 Created` with the newly created leave request object. |
| **GET** | `/api/leave/my-requests` | Get your leave requests | Authenticated | | `200 OK` with a JSON array of your leave request objects. |
| **PUT** | `/api/leave/{leaveId}` | Approve/Reject a leave request | Admin | `{ "status": "APPROVED" }` | `200 OK` with the updated leave request object. |

### Attendance

| Method | Endpoint | Description | Access | Sample Body | Expected Output (Success) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/attendance` | Get attendance for all users | Admin | | `200 OK` with a JSON array of attendance records. |
| **POST** | `/api/attendance/check-in` | Record your check-in | Authenticated | | `201 Created` with the new attendance record object. |
| **POST** | `/api/attendance/check-out` | Record your check-out | Authenticated | | `200 OK` with the updated attendance record object (with check-out time). |

### Expenses

| Method | Endpoint | Description | Access | Sample Body | Expected Output (Success) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/expenses` | Get all expense requests | Admin | | `200 OK` with a JSON array of expense objects. |
| **POST** | `/api/expenses` | Submit an expense request | Authenticated | `{ "amount": 150.75, "description": "Client dinner", "category": "FOOD" }` | `201 Created` with the newly created expense object. |
| **GET** | `/api/expenses/my-requests` | Get your expense requests | Authenticated | | `200 OK` with a JSON array of your expense objects. |
| **PUT** | `/api/expenses/{expenseId}` | Approve/Reject an expense request | Admin | `{ "status": "APPROVED" }` | `200 OK` with the updated expense object. |

### Invoices

| Method | Endpoint | Description | Access | Sample Body | Expected Output (Success) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/invoices`| Get all invoices | Admin / Finance | | `200 OK` with a JSON array of invoice objects. |
| **POST** | `/api/invoices`| Create a new invoice | Admin / Finance | `{ "projectId": "some-project-id", "amount": 2500.00, "issuedTo": "Client Corp" }` | `201 Created` with the newly created invoice object. |
