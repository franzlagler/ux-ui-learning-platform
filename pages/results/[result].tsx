import { NextPageContext } from 'next';
import { Session } from 'next-auth';
import { getSession } from 'next-auth/client';
import Image from 'next/image';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { RegularButton } from '../../components/Buttons';
import {
  HeadingContainer,
  WideContainer,
} from '../../components/ContainerElements';
import { PrimHeading, SecHeading } from '../../components/TextElements';
import { removeCookie } from '../../util/cookies';
import {
  findProfile,
  findQuestions,
  findResult,
} from '../../util/DB/findQueries';

interface ExtendedSessionType extends Session {
  user?: {
    _id?: string;
    name?: string | null | undefined;
    email?: string | null | undefined;
    image?: string | null | undefined;
  };
}

const SingleResultContainer = styled.div`
  position: relative;
  width: 100%;
  height: auto;
  padding: 10px 20px;
  margin-bottom: 20px;
  background-color: #fff;
  border: 3px solid #212529;
  border-radius: 15px;
`;

const AnswerContainer = styled.div`
  display: flex;
  grid-gap: 10px;
  align-items: center;
  padding: 10px;
  margin-bottom: 5px;
  background-color: ${(props: { backgroundColor: string }) =>
    props.backgroundColor};
  border-radius: 5px;
`;

const AnswerText = styled.p`
  font-size: 20px;
`;

const Checkbox = styled.input`
  appearance: none;
  width: 20px;
  height: 20px;
  border: 1px solid #212529;
  border-radius: 3px;

  &:checked {
    background: url('/images/cross.svg') no-repeat center;
  }
`;

export default function Results({ result, topicQuestions }) {
  const router = useRouter();

  const redoQuiz = () => {
    removeCookie('result');
    router.push(`/quizzes/${topicQuestions[0].keyword}`);
  };
  return (
    <WideContainer>
      <PrimHeading>Results</PrimHeading>
      {topicQuestions.map(
        (
          el: {
            _id: string;
            question: string;
            answer1: string;
            answer2: string;
            answer3: string;
            answer4: string;
          },
          index: number,
        ) => {
          return (
            <SingleResultContainer key={el._id}>
              <HeadingContainer>
                <SecHeading>
                  {index + 1}. {el.question}
                </SecHeading>
                <Image
                  src={`/images/${
                    result.isCorrectlyAnswered[index]
                      ? 'correctAnswer'
                      : 'wrongAnswer'
                  }.svg`}
                  width="30px"
                  height="30px"
                />
              </HeadingContainer>
              <AnswerContainer
                backgroundColor={
                  topicQuestions[index].correctAnswers[0] === true &&
                  result.questionAnswers[index][0] === true
                    ? '#76f5c0'
                    : ''
                }
              >
                <Checkbox
                  type="checkbox"
                  disabled
                  checked={
                    result.questionAnswers[index][0] === true ? true : false
                  }
                />
                <AnswerText>{el.answer1}</AnswerText>
              </AnswerContainer>
              <AnswerContainer
                backgroundColor={
                  topicQuestions[index].correctAnswers[1] === true &&
                  result.questionAnswers[index][1] === true
                    ? '#76f5c0'
                    : ''
                }
              >
                <Checkbox
                  type="checkbox"
                  disabled
                  checked={
                    result.questionAnswers[index][1] === true ? true : false
                  }
                />
                <AnswerText>{el.answer2}</AnswerText>
              </AnswerContainer>
              <AnswerContainer
                backgroundColor={
                  topicQuestions[index].correctAnswers[2] === true &&
                  result.questionAnswers[index][2] === true
                    ? '#76f5c0'
                    : ''
                }
              >
                <Checkbox
                  type="checkbox"
                  disabled
                  checked={
                    result.questionAnswers[index][2] === true ? true : false
                  }
                />
                <AnswerText>{el.answer3}</AnswerText>
              </AnswerContainer>
              <AnswerContainer
                backgroundColor={
                  topicQuestions[index].correctAnswers[3] === true &&
                  result.questionAnswers[index][3] === true
                    ? '#76f5c0'
                    : ''
                }
              >
                <Checkbox
                  type="checkbox"
                  disabled
                  checked={
                    result.questionAnswers[index][3] === true ? true : false
                  }
                />
                <AnswerText>{el.answer4}</AnswerText>
              </AnswerContainer>
            </SingleResultContainer>
          );
        },
      )}
      <RegularButton onClick={redoQuiz}>Try Again</RegularButton>
    </WideContainer>
  );
}

export async function getServerSideProps(context: NextPageContext) {
  const session: ExtendedSessionType | null = await getSession({
    req: context.req,
  });
  if (!session) {
    return {
      destination: '/auth/signin',
      permanent: false,
    };
  }

  if (typeof context.query.result === 'string') {
    const [enteredProfileId, topicNumber] = context.query.result.split('-');

    const userId = session.user?._id;

    const foundProfile = await findProfile(userId?.toString());
    const profileId = foundProfile?._id.toString();

    if (profileId !== enteredProfileId) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      };
    }

    const result = await findResult(profileId, Number(topicNumber));
    if (!result) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      };
    }

    const topicQuestions = await findQuestions(Number(topicNumber));

    return {
      props: { result, topicQuestions },
    };
  }
}
