import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import CardLayout from 'components/CardLayout/CardLayout';
import Input from 'components/shared/Input/Input';
import TextButton from 'components/shared/TextButton/TextButton';
import Notification from 'components/shared/Notification/Notification';
import ServerSelector from 'components/ServerSelector/ServerSelector';
import { useAppDispatch, useAppSelector } from 'modules/hooks';
import { selectServer } from 'modules/serverSlice';
import { ButtonSize, ButtonType } from 'types';
import ROUTE from 'constants/routes';
import { API_STATUS } from 'constants/api';
import { ALERT_MESSAGE, NOTIFICATION } from 'constants/messages';
import Styled from './styles';
import { requestCheckDuplicatedEmail, requestSignup } from 'request/auth';

const SignupPage = () => {
  const dispatch = useAppDispatch();
  const BASE_URL = useAppSelector((state) => state.serverSlice.server);
  const { enqueueSnackbar } = useSnackbar();

  const [email, setEmail] = useState<string>('');
  const [age, setAge] = useState<number>();
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [passwordNotification, setPasswordNotification] = useState({
    message: '',
    isValid: false,
    isVisible: false,
  });
  const [emailNotification, setEmailNotification] = useState({
    message: '',
    isValid: false,
    isVisible: false,
  });
  const [isServerMessageVisible, setServerMessageVisible] = useState<boolean>(false);

  const history = useHistory();

  const checkDuplicatedEmail = async () => {
    const res = await requestCheckDuplicatedEmail(BASE_URL, email);

    if (res.status === API_STATUS.REJECTED) {
      enqueueSnackbar(ALERT_MESSAGE.SERVER_ERROR);
    } else if (res.status === API_STATUS.FULFILLED) {
      if (res.data.exist) {
        setEmailNotification({
          message: NOTIFICATION.DUPLICATED_EMAIL,
          isValid: false,
          isVisible: true,
        });
      } else {
        setEmailNotification({
          message: NOTIFICATION.AVAILABLE_EMAIL,
          isValid: true,
          isVisible: true,
        });
      }
    }
  };

  const checkPasswordMatch = () => {
    if (password !== confirmPassword) {
      setPasswordNotification({
        message: NOTIFICATION.DISMATCH_PASSWORD,
        isValid: false,
        isVisible: true,
      });
      return false;
    } else {
      setPasswordNotification({
        message: NOTIFICATION.MATCH_PASSWORD,
        isValid: true,
        isVisible: true,
      });
      return true;
    }
  };

  const signup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!checkPasswordMatch()) return;
    if (!BASE_URL) {
      setServerMessageVisible(true);
      return;
    }

    const signupData = { email, password, age: age || 1 };

    const res = await requestSignup(BASE_URL, signupData);

    if (res.status === API_STATUS.REJECTED) {
      enqueueSnackbar(res.message);
    } else if (res.status === API_STATUS.FULFILLED) {
      enqueueSnackbar(ALERT_MESSAGE.SUCCESS_TO_SIGNUP);
      history.push(ROUTE.LOGIN);
    }
  };

  const changeServer = (server: string) => {
    dispatch(selectServer({ server }));
    setServerMessageVisible(false);
  };

  return (
    <>
      <CardLayout title="회원가입">
        <form onSubmit={signup}>
          <Styled.InputContainer>
            <Styled.InputWrapper>
              <Input
                type="email"
                labelText="이메일"
                placeholder="이메일을 입력해주세요."
                value={email}
                onBlur={checkDuplicatedEmail}
                onChange={(event) => setEmail(event.target.value)}
              />
              <Notification
                message={emailNotification.message}
                isValid={emailNotification.isValid}
                isVisible={emailNotification.isVisible}
              />
            </Styled.InputWrapper>
            <Styled.InputWrapper>
              <Input
                type="number"
                labelText="나이"
                placeholder="나이를 입력해주세요."
                value={age}
                onChange={(event) => setAge(Number(event.target.value))}
                extraArgs={{ min: '1', max: Number.MAX_SAFE_INTEGER.toString() }}
              />
            </Styled.InputWrapper>
            <Styled.InputWrapper>
              <Input
                type="password"
                labelText="비밀번호"
                placeholder="비밀번호를 입력해주세요."
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                extraArgs={{ minLength: 6 }}
              />
            </Styled.InputWrapper>
            <Styled.InputWrapper>
              <Input
                type="password"
                labelText="비밀번호 확인"
                placeholder="비밀번호를 한번 더 입력해주세요."
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                onBlur={checkPasswordMatch}
                extraArgs={{ minLength: 6 }}
              />
              <Notification
                message={passwordNotification.message}
                isValid={passwordNotification.isValid}
                isVisible={passwordNotification.isVisible}
              />
            </Styled.InputWrapper>
          </Styled.InputContainer>

          <Styled.ButtonWrapper>
            <TextButton
              text="회원가입하기"
              styleType={ButtonType.YELLOW}
              sizeType={ButtonSize.LARGE}
            ></TextButton>
          </Styled.ButtonWrapper>
        </form>
      </CardLayout>
      <ServerSelector isMessageVisible={isServerMessageVisible} changeServer={changeServer} />
    </>
  );
};

export default SignupPage;