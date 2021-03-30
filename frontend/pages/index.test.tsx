import React from 'react'
import Index from "./index";
import { create } from "react-test-renderer";

describe('<Index />', () => {
  it('should match snapshot', () => {
    const component = create(<Index />);
    expect(component).toMatchSnapshot();
  })
})