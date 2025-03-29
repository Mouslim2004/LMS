$(document).ready(function(){
  $('#updateForm').on('submit', function(e){
    e.preventDefault()

    const formData = new FormData(this)
    const studentId = $(this).data('student-id')
    // console.log(studentId)
    $.ajax({
      url: '/user/updateUser/' + studentId,
      type: 'PUT',
      data: JSON.stringify(formData),
      contentType: 'application/json',
      // processData: false,
      success: function(response){
        console.log('Updated successfully : ', response)
        window.location.reload()
      },
      error: function(error){
        console.log('Error : ', error)
      }
    })
  })

})

