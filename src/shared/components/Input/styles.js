import styled, { css } from 'styled-components';

import { color, font } from 'shared/utils/styles';

export const StyledInput = styled.div`
  position: relative;
  display: inline-block;
  height: 32px;
  width: 100%;
`;

export const InputElement = styled.input`
  height: 100%;
  width: 100%;
  padding: 0 7px;
  border-radius: 3px;
  border: 1px solid ${color.borderLightest};
  color: ${color.textDark};
  background: ${color.backgroundLightest};
  transition: background 0.1s;
  ${font.regular}
  ${font.size(15)}
  &:hover,
  &:focus {
    ${font.black}
  }
  &:hover {
    background: ${color.backgroundLight};
  }
  &:focus {
    background: #fff;
    border: 1px solid ${color.borderInputFocus};
    box-shadow: 0 0 0 1px ${color.borderInputFocus};
  }
  ${(props) =>
    props.invalid &&
    css`
      &,
      &:focus {
        border: 1px solid ${color.danger};
        box-shadow: none;
      }
    `}
`;
