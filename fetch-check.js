async function check() {
  try {
    const res = await fetch('http://localhost:3000/pacientes');
    const text = await res.text();
    console.log("STATUS:", res.status);
    console.log("BODY:", text.slice(0, 1000));
  } catch (err) {
    console.error("FETCH ERROR:", err.message);
  }
}
check();
