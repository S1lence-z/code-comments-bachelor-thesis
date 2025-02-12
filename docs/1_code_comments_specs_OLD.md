## 1. Code Commenting Platform (Code With Peers)

### Features:

1. **Project Management**

    - Create projects and assign students and teachers
    - Set milestones and possible deadlines

2. **Code Review and Commenting**

    - Inline commenting: Teachers can click specific lines of code and leave comments
    - Threaded discussions on comments for back-and-forth clarification
    - Mark comments as "Resolved" once addressed

3. **Git Workflow Integration**

    - Basic Git functionality: clone, push, pull, branches
    - A simple UI (such like git control UI in VS Code) could introduce the basics of git to new students.

4. **Student Submissions**

    - Submit code directly via the platform (file upload or Git integration)
    - Notifications for submissions and updates

5. **Teacher Feedback Tools**

    - Highlight areas needing improvement and code review (as mentioned above)
    - Attach resources or examples to comments

6. **Real-Time Collaboration**

    - Live editing for students working in teams (like in drawio)
    - Real-time comment notifications

7. **Search and Tagging**
    - Search across teacher's comments
    - Let the comments have specific tags for easier organization (logic, optimization, code quality)

---

### Workflow example

#### 1. **Project Creation by Teacher**

-   The teacher logs into the platform and creates a new project
-   The teacher also assigns students to the project

#### 2. **Assigning Students and Setting Up Repositories**

-   The teacher assigns students to the project
-   A Git repository is automatically created and shared with the students

#### 3. **Student Submission and Code Updates**

-   Students clone the repository and start working
-   The platform notifies the teacher of any submission

#### 4. **Teacher’s Code Review**

-   The teacher reviews the pushed code:
    -   Clicks on a specific line
    -   Leaves an inline comment
    -   Tags the comment as **logic**.
    -   May attach a Python snippet showing proper error handling

#### 5. **Student Responds to Comments**

-   Alice responds to the comment:
    -   Marks the comment as **Resolved**.
    -   Replies that the issue has been resolved

#### 6. **Team Collaboration**

-   Bob and Charlie collaborate in real time, seeing live changes

#### 7. **Final Review and Feedback**

-   The teacher conducts a final review:
    -   Reviews all resolved and unresolved comments
    -   Highlights areas where students performed well
    -   Leaves general feedback

#### 8. **Project Closure**

-   The teacher marks the project as **Complete**.
-   The students receive a notification with detailed feedback and a summary of their resolved comments

---

### Similar platforms

1. https://www.reviewboard.org/
    - I need to look more into it but it seems like a platform which enables any uploaded document to add comments in specific places so they are easily visible and identifiable
    - Not strictly for coding (although it seems well done)
