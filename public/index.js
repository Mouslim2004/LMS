// $(document).ready(() => {
//   $("#userSignupbtn").on('submit',function(e){
//     e.preventDefault()

//     // Capture form data
//     const signupData = {
//       avatar: $('#avatar').val(),
//       name: $('#name').val(),
//       cne: $('#cne').val(),
//       phone: $('#phone').val(),
//       address: $('#avatar').val(),
//       email: $('#email').val(),
//       password: $('#password').val()
//     };
//     $.ajax({
//       type: 'post',
//       url: '/userSignup',
//       contentType: 'application/json', //'application/json'
//       data: JSON.stringify(signupData),//JSON.stringify(signupData)
//       success: (response) => {
//         console.log('Login successful : ',response);

//         // Clear the form fields
//         $('#avatar').val('');
//         $('#name').val('');
//         $('#cne').val('');
//         $('#email').val('');
//         $('#phone').val('');
//         $('#address').val('');
//         $('#password').val('');

//         // $('#userSignupbtn')[0].reset();

//         // window.location.href = "/";
//       },
//       error: (error) => {
//         console.error('Error logging in : ', error);
//         // window.location.href = '/login';
//       }
//     })
//   })
// })