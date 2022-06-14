
async function a() {
  return 123
}

export default (props) => {
  const { b, ...rest } = props
  a()
  return <div {...rest}>123132</div>
}
