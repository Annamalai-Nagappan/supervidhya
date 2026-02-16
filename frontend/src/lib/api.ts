const API_BASE_URL = "http://localhost:5000/api/exam";

export const uploadQuestionPaper = async (file: File, examId: string, setCode: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("examId", examId);
    formData.append("setCode", setCode);

    const response = await fetch(`${API_BASE_URL}/upload-question-paper`, {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to upload question paper");
    }

    return response.json();
};

export const uploadModelAnswer = async (file: File, examSetId: number) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("examSetId", String(examSetId));

    const response = await fetch(`${API_BASE_URL}/upload-model-answer`, {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to upload model answer");
    }

    return response.json();
};

export const uploadStudentSubmission = async (file: File, examId: string, examSetId: number, studentId: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("examId", examId);
    formData.append("examSetId", String(examSetId));
    formData.append("studentId", studentId);

    const response = await fetch(`${API_BASE_URL}/upload-student-submission`, {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to upload student submission");
    }

    return response.json();
};

export const evaluateSubmission = async (submissionId: number) => {
    const response = await fetch(`${API_BASE_URL}/evaluate-submission/${submissionId}`, {
        method: "POST",
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to evaluate submission");
    }

    return response.json();
};
