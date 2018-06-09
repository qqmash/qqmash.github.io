jQuery(document).ready(function(){

    // ткрываем клавиатуру
    $('#requisite-fio,#requisite').on('click', function (event){
        $('#rqcbox-fio').toggle(event.target.id == 'requisite-fio').find('input').focus().val($('#requisite-fio').text());
        $('#rqcbox-inn').toggle(event.target.id == 'requisite')    .find('input').focus().val($('#requisite').text());
        return false;
    });

    // клавиши навигации внизу экрана
    $('.navigation-buttons .cancel').mousedown(function(event) {
        let $boxShown = $('#rqcbox-fio:visible, #rqcbox-inn:visible').hide();
        if (!$boxShown)
            Page.getMoneyPageBack();
    });

    $('.navigation-buttons .next').mousedown(function(event) {
        let $boxShown = $('#rqcbox-fio:visible, #rqcbox-inn:visible').find('.key.enter:eq(0)').click();
        if (!$boxShown)
            Page.checkRequisitePageNext();
    });

    // клавиатуры
    $('.klava .key').click(function(event){

        var $thisBtn = $(this);
        var $kb = $thisBtn.closest('.klava');
        var $input = $($kb.data('forInput')).focus();
        var Einput = $input.get(0);
        var specialkey = $thisBtn.data('specialkey');

        var mode = key => $kb.data(key)  || false;
        var capsl = () => mode('capslock');
        var shift = () => mode('shift');

        function showCapsState() {
            $kb.find('.capslock').toggleClass('toggled', capsl() );
            $kb.find('.shift').toggleClass('toggled', shift() );
            $kb.css('text-transform',
                    capsl() != shift()
                    ? 'uppercase'
                    : 'none'
                );
        }

        //Если специальная функция
        if(specialkey){

            switch (specialkey) {
                case 'Enter':
                    $($input.data('saveto')).text($input.val());
                    $kb.closest('.requisite-checking-box').hide();
                    break;
                case 'Space':
                    DocumentSelection.insertAtCursor(Einput, ' ');
                    break;
                case 'CE':
                    $input.val('');
                    break;
                case 'Del':
                    DocumentSelection.deleteAtCursor(Einput, true);
                    break;
                case 'BackSpace':
                    DocumentSelection.deleteAtCursor(Einput, false);
                    break;
                case 'Tab':
                    $input.val( $input.val() + '\t' );
                    break;
                case 'CapsLock':
                    $kb.data('capslock', !capsl());
                    showCapsState();
                    break;
                case 'Shift':
                    $kb.data('shift', !shift());
                    showCapsState();
                    break;
            }

        }else{
            let char = capsl() != shift()
                ?  $thisBtn.find('sup').text() || $thisBtn.find('span').text().toUpperCase()
                : $thisBtn.find('span').text() ;

            $kb.data('shift', false).css('text-transform', capsl() ? 'uppercase':'none' ).find('.shift') .removeClass('toggled');

            if ( $input.val().length < $input.attr('maxlength') )
                DocumentSelection.insertAtCursor(Einput, char);
        }
        $input.focus();
    });
});
