import styled, { css } from "styled-components";
import { mixin, font, color } from "shared/utils/styles";

export const StyledButton = styled.button`
  position: relative;
  align-items: center;
  justify-content: center;
  height: 3rem;
  vertical-align: middle;
  line-height: 1;
  white-space: nowrap;
  border-radius: 3px;
  transition: all 0.1s;
  appearance: none;
  ${mixin.clickable}
  ${font.size(18)}
  ${props => buttonVariants[props.variant]}
  &:disabled {
      opacity: 0.6;
      cursor: default;
  }
`;

const colored = css`
  color: #fff;
  background: ${props => color[props.variant]};
  ${font.medium}
  &:not(:disabled) {
    &:hover {
      background: ${props => mixin.lighten(color[props.variant], 0.15)};
    }
    &:active {
      background: ${props => mixin.darken(color[props.variant], 0.1)};
    }
    ${props =>
      props.isActive &&
      css`
        background: ${mixin.darken(color[props.variant], 0.1)} !important;
      `}
  }
`;

const secondaryAndEmptyShared = css`
  color: ${color.textDark};
  ${font.regular}
  &:not(:disabled) {
    &:hover {
      background: ${color.backgroundLight};
    }
    &:active {
      color: ${color.primary};
      background: ${color.backgroundLightPrimary};
    }
    ${props =>
      props.isActive &&
      css`
        color: ${color.primary};
        background: ${color.backgroundLightPrimary} !important;
      `}
  }
`;


const buttonVariants = {
    primary: colored,
    success: colored,
    danger: colored,
    secondary: css`
      background: ${color.secondary};
      ${secondaryAndEmptyShared};
    `,
    empty: css`
      background: #fff;
      ${secondaryAndEmptyShared};
    `,
  };
