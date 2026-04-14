const form = document.getElementById(
    "wf-form-Contact-Form"
  );
  const successMsg =
    document.querySelector(".success-message");
  const errorMsg = document.querySelector(".error-message");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector(
      'input[type="submit"]'
    );
    submitBtn.disabled = true;
    submitBtn.value = "Please wait...";

    const formData = {
      fullName: form.name.value.trim(),
      email: form.email.value.trim(),
      subject: "Contact Form Submission",
      message: form["field"].value.trim(),
    };

    try {
      const res = await fetch(
        "https://cms.uisto.edu.ng/api/v1/contact",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();

      if (res.ok) {
        successMsg.style.display = "block";
        errorMsg.style.display = "none";
        form.reset();
      } else {
        successMsg.style.display = "none";
        errorMsg.style.display = "block";
        console.error("Error:", data);
      }
    } catch (err) {
      successMsg.style.display = "none";
      errorMsg.style.display = "block";
      console.error("Network error:", err);
    } finally {
      submitBtn.disabled = false;
      submitBtn.value = "Submit";
    }
  });