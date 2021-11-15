import { Document } from 'bson';

export const getPreviousQuizTitle = (
  results: number[],
  allTopics: { topicNumber: number; title: string }[],
) => {
  const previousQuizData: { title: string }[] = [];

  for (let i = 0; i < results.length; i++) {
    for (let j = 0; j < allTopics.length; j++) {
      if (results[i] === allTopics[j].topicNumber) {
        previousQuizData.push({ title: allTopics[j].title });
      }
    }
  }
  return previousQuizData;
};

export const updateAnswers = (
  selectedAnswers: boolean[],
  allAnswers: (number | boolean[])[],
  currentQuestionNumber: number,
) => {
  allAnswers = allAnswers.map((el: number | boolean[], index: number) => {
    if (index === currentQuestionNumber) {
      return selectedAnswers;
    }

    return el;
  });

  return allAnswers;
};

export const checkIfAnswersCorrect = (
  userAnswers: any,
  questions: Document[],
) => {
  const questionIsCorrectlyAnswered = [];
  for (let i = 0; i < userAnswers.length; i++) {
    let isCorrect = true;
    for (let j = 0; j < userAnswers[i].length; j++) {
      if (userAnswers[i][j] !== questions[i].correctAnswers[j]) {
        isCorrect = false;
      }
    }
    questionIsCorrectlyAnswered.push(isCorrect);
  }
  return questionIsCorrectlyAnswered;
};
