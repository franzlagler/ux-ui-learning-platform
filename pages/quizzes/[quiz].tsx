import { NextPageContext } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { AnswerButton, RegularButton } from '../../components/Buttons';
import { NarrowContainer } from '../../components/ContainerElements';
import {
  getCookies,
  setCookies,
  setCookieValue,
  updateAnswers,
} from '../../util/cookies';
import { findCurrentQuestion, findTopicQuestions } from '../../util/dbQueries';
import { connectToDatabase } from '../../util/mongodb';

const QuestionContainer = styled.div`
  position: relative;
  margin-bottom: 20px;
  border: 3px solid #212529;
  border-radius: 15px;
  overflow: hidden;
  text-align: center;
`;
const PrimHeadingContainer = styled.div`
  padding: 20px 10px;
`;

const AnswersContainer = styled.div`
  display: grid;
  grid-gap: 20px;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 380px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  grid-gap: 20px;
`;

const QuestionNumber = styled.p`
  width: fit-content;
  margin: 0 auto;
  padding: 10px 20px;
  background-color: #ffee99;
  border: 2px solid #212529;
  border-radius: 15px;
  font-size: 22px;
  font-weight: 600;
`;

type QuizProps = {
  currentQuestion: {
    _id: string;
    topicNumber: number;
    keyword: string;
    question: string;
    answer1: string;
    answer2: string;
    answer3: string;
    answer4: string;
  };
  currentQuestionNumber: number;
  totalQuestionsNumber: number;
};

export default function Quiz({
  currentQuestion,
  currentQuestionNumber,
  totalQuestionsNumber,
}) {
  const router = useRouter();

  const [selectedAnswers, setSelectedAnswers] = useState([
    false,
    false,
    false,
    false,
  ]);

  const updateSelectedAnswers = (e: React.MouseEvent<HTMLButtonElement>) => {
    const buttonIndex = Number(e.currentTarget.id) - 1;

    setSelectedAnswers(
      selectedAnswers.map((el, index) => (index === buttonIndex ? !el : el)),
    );
  };

  const goToNextQuestion = () => {
    let questionAnswers = getCookies('questionAnswers');

    questionAnswers = updateAnswers(
      selectedAnswers,
      questionAnswers,
      currentQuestionNumber,
    );

    setCookies('questionAnswers', questionAnswers);

    router.push(
      `/quizzes/${currentQuestion.keyword.slice(
        0,
        currentQuestion.keyword.length - 1,
      )}${Number(currentQuestionNumber) + 1}`,
    );
  };

  const goToLastQuestion = () => {
    let questionAnswers = getCookies('questionAnswers');

    questionAnswers = updateAnswers(
      selectedAnswers,
      questionAnswers,
      currentQuestionNumber,
    );

    setCookies('questionAnswers', questionAnswers);
    router.push(
      `/quizzes/${currentQuestion.keyword.slice(
        0,
        currentQuestion.keyword.length - 1,
      )}${Number(currentQuestionNumber) - 1}`,
    );
  };

  const finishQuiz = () => {
    let questionAnswers = getCookies('questionAnswers');

    questionAnswers = updateAnswers(
      selectedAnswers,
      questionAnswers,
      currentQuestionNumber,
    );

    setCookies('questionAnswers', questionAnswers);
    router.push('/results');
  };

  useEffect(() => {
    if (!getCookies('questionAnswers')) {
      setCookies(
        'questionAnswers',
        setCookieValue(currentQuestion.topicNumber, totalQuestionsNumber),
      );
    }
    const allAnswers = getCookies('questionAnswers');

    const currentlySelectedAnswers = allAnswers[currentQuestionNumber];
    setSelectedAnswers(currentlySelectedAnswers);
  }, [
    currentQuestionNumber,
    currentQuestion.topicNumber,
    totalQuestionsNumber,
  ]);
  return (
    <NarrowContainer>
      <QuestionContainer>
        <PrimHeadingContainer>
          <h2>{currentQuestion.question}</h2>
        </PrimHeadingContainer>
        <ImageContainer>
          <Image
            src={`/images/questions/${currentQuestion.keyword}.svg`}
            layout="fill"
            objectFit="cover"
          />
        </ImageContainer>
      </QuestionContainer>
      <AnswersContainer>
        <AnswerButton
          backgroundColor={selectedAnswers[0]}
          id="1"
          name="answer1"
          onClick={updateSelectedAnswers}
        >
          {currentQuestion.answer1}
        </AnswerButton>
        <AnswerButton
          backgroundColor={selectedAnswers[1]}
          id="2"
          name="answer2"
          onClick={updateSelectedAnswers}
        >
          {currentQuestion.answer2}
        </AnswerButton>
        <AnswerButton
          backgroundColor={selectedAnswers[2]}
          id="3"
          name="answer3"
          onClick={updateSelectedAnswers}
        >
          {currentQuestion.answer3}
        </AnswerButton>
        <AnswerButton
          backgroundColor={selectedAnswers[3]}
          id="4"
          name="answer4"
          onClick={updateSelectedAnswers}
        >
          {currentQuestion.answer4}
        </AnswerButton>
      </AnswersContainer>
      <ButtonContainer>
        <RegularButton
          disabled={currentQuestionNumber === 1}
          onClick={goToLastQuestion}
        >
          Back
        </RegularButton>
        {currentQuestionNumber < 3 && (
          <RegularButton purple onClick={goToNextQuestion}>
            Next
          </RegularButton>
        )}
        {currentQuestionNumber === 3 && (
          <Link href="/results" passHref>
            <RegularButton purple onClick={finishQuiz}>
              Finish
            </RegularButton>
          </Link>
        )}
      </ButtonContainer>

      <QuestionNumber>
        {currentQuestionNumber} out of {totalQuestionsNumber} questions
      </QuestionNumber>
    </NarrowContainer>
  );
}

export async function getServerSideProps(context: NextPageContext) {
  const keyword = context.query.quiz;

  const currentQuestion = await findCurrentQuestion(keyword);
  const allTopicQuestions = await findTopicQuestions(
    currentQuestion.topicNumber,
  );
  const totalQuestionsNumber = allTopicQuestions.length;

  const currentQuestionNumber = Number(
    currentQuestion.keyword[currentQuestion.keyword.length - 1],
  );

  return {
    props: {
      currentQuestion,
      currentQuestionNumber,
      totalQuestionsNumber,
    },
  };
}
