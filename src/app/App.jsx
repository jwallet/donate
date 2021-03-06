import React from 'react';
import { get } from 'lodash';
import SlackNotifier from 'actions/slackNotifier';
import Paypal from 'actions/paypal';
import Stripe from 'actions/stripe';
import { Form } from 'shared/components';
import { CurrenciesEnum, CurrenciesSymbol } from 'shared/constants/currencies';
import { StepsEnum } from 'shared/constants/steps';
import { GiftItemsEnum } from 'shared/constants/amounts';
import { usePaypalPaymentSucceeded } from 'shared/hooks/paypal';

import { CardNumberElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { PaymentModesEnum } from 'shared/constants/payments';
import Header from './Header';
import AmountForm from './AmountForm';
import DonorForm from './DonorForm';
import PaymentForm from './PaymentForm';
import { StyledPoweredLink } from './styles';
import Thanks from './Thanks';

const initialValues = {
  [StepsEnum.AMOUNT]: {
    amount: null,
    giftItem: '',
    customAmount: null,
    currency: CurrenciesEnum.USD,
    wantsToComment: false,
    comment: '',
  },
  [StepsEnum.DONOR]: {
    firstName: '',
    lastName: '',
    email: '',
    wantsToBeAnonymous: false,
  },
  [StepsEnum.PAYMENT]: {
    postalCode: '',
  },
};

const validAmount = (message) => (value, { customAmount }) => {
  if (value === GiftItemsEnum.CUSTOM) return Form.is.number(message)(customAmount);
  return Form.is.required(message)(value);
};

const validations = {
  [StepsEnum.AMOUNT]: {
    currency: Form.is.required(),
    giftItem: validAmount('Please select or enter an amount'),
  },
  [StepsEnum.DONOR]: {
    firstName: Form.is.required(),
    lastName: Form.is.required(),
    email: [Form.is.required(), Form.is.email()],
  },
  [StepsEnum.PAYMENT]: {},
};

const handleNextStep = ({ setFormsBag, formsBag, step, setStep }) => async (values) => {
  switch (step) {
    case StepsEnum.AMOUNT: {
      const { giftItem, customAmount } = values;
      const amount =
        giftItem === GiftItemsEnum.CUSTOM
          ? customAmount
          : AmountForm.giftOptionsUSD.find((d) => d.value === giftItem).amount;
      setFormsBag({ ...formsBag, [step]: { ...values, amount } });
      setStep(step + 1);
      break;
    }
    case StepsEnum.DONOR:
    default:
      setFormsBag({ ...formsBag, [step]: values });
      setStep(step + 1);
      break;
  }
};

const handleSubmit = ({
  formsBag,
  setFormsBag,
  paymentMode,
  setStep,
  stripeElements,
  stripe,
  showThanksNote,
}) => async (values, actions) => {
  const bag = Object.values(formsBag).reduce((acc, x) => ({ ...acc, ...x }), values);
  const giftItemLabel = get(
    AmountForm.giftOptionsUSD.find((d) => d.value === bag.giftItem),
    'label',
    '',
  );
  const donation = `${CurrenciesSymbol[bag.currency]} ${bag.amount.toFixed(2)}`;
  const donor = `${bag.wantsToBeAnonymous ? 'Anonymous' : [bag.firstName, bag.lastName].join(' ')}`;
  const updatedBag = { ...bag, giftItemLabel, donation, donor };

  switch (paymentMode) {
    case PaymentModesEnum.PAYPAL:
      Paypal.saveDataToCookie(updatedBag);
      await SlackNotifier.paymentAttempt(PaymentModesEnum.PAYPAL, updatedBag);
      Paypal.proceedToPaypal(updatedBag);
      break;
    case PaymentModesEnum.STRIPE: {
      const card = stripeElements.getElement(CardNumberElement);
      const [error, success] = await Stripe.proceedPayment(stripe, card, updatedBag);
      if (!success) {
        actions.setFieldError('stripeError', error);
        return;
      }
      SlackNotifier.paymentSucceeded(PaymentModesEnum.STRIPE, updatedBag);
      showThanksNote();
      break;
    }
    default:
      break;
  }
  setStep(StepsEnum.AMOUNT);
  setFormsBag({});
  actions.resetForm();
};

const App = () => {
  const [donated, setDonated] = React.useState(false);
  const [step, setStep] = React.useState(StepsEnum.AMOUNT);
  const [paymentMode, setPaymentMode] = React.useState(PaymentForm.paymentModes[0]);
  const [formsBag, setFormsBag] = React.useState({});

  const stripe = useStripe();
  const stripeElements = useElements();

  const showThanksNote = () => setDonated(true);

  usePaypalPaymentSucceeded(showThanksNote);

  return (
    <React.Fragment>
      <Form
        enableReinitialize
        initialValues={{ ...initialValues[step], ...formsBag[step] }}
        validations={validations[step]}
        onSubmit={
          step === StepsEnum.PAYMENT
            ? handleSubmit({
                formsBag,
                setFormsBag,
                paymentMode,
                setStep,
                stripeElements,
                stripe,
                showThanksNote,
              })
            : handleNextStep({ step, setStep, formsBag, setFormsBag })
        }
      >
        {({ values: { currency, wantsToComment, wantsToCoverFees } }) => (
          <Form.Element>
            <Header step={step} onStepChange={setStep} />
            {step === StepsEnum.AMOUNT && (
              <AmountForm currency={currency} wantsToComment={wantsToComment} />
            )}
            {step === StepsEnum.DONOR && <DonorForm />}
            {step === StepsEnum.PAYMENT && (
              <PaymentForm
                amount={formsBag[StepsEnum.AMOUNT].amount}
                currency={formsBag[StepsEnum.AMOUNT].currency}
                wantsToCoverFees={wantsToCoverFees}
                paymentMode={paymentMode}
                onPaymentModeChange={setPaymentMode}
              />
            )}
          </Form.Element>
        )}
      </Form>
      {donated && <Thanks onClose={() => setDonated(false)} />}
      <StyledPoweredLink href="https://github.com/jwallet/donate" target="_blank">
        Powered by DonorboxClone
      </StyledPoweredLink>
    </React.Fragment>
  );
};

export default App;
