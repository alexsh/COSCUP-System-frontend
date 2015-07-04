var baseUrl = '//staff.coscup.org/coscup';
//var baseUrl = '//coscup.nfsnfs.net/coscup';

var fields_header = [ 
    'id', 'email', 'redmine', 'last_name', 'first_name', 'nickname', 'gender', 'phone', 
    'id-number', 'team', 'food', 't-shirt', 'certificate', 'traffic', 'origin',
    'transport-fee', 'transportation', 'commuting', 'accommodation', 
    'accommodation-comment', 'language', 'skill', 'new', 'birthday', 'others', 'project' ];

var fields_header_translation = { 
    'accommodation': '住宿', 
    'accommodation-comment': '住宿同房意願登記',
    'birthday': '生日',
    'certificate': '感謝狀',
    'comment': '註解',
    'commuting': '通勤>1小時?',
    'email': 'Email',
    'first_name': '名',
    'last_name': '姓',
    'food': '食物',
    'gender': '性別',
    'id': 'ID',
    'id-number': '身份證字號',
    'language': '語言能力',
    'new': '第一次參加 COSCUP',
    'nickname': '暱稱',
    'origin': '出發地',
    'others': '其他意見',
    'phone': '手機',
    'project': '參與專案',
    'redmine': 'Redmine ID',
    'role': 'role',
    'skill': '技能',
    't-shirt': 'T-shirt 尺寸',
    'team': '組別',
    'traffic': '交通補助',
    'transport-fee': '預估交通費',
    'transportation': '預計交通方式',
};


$(function() {
    // click listener on buttons
    $('body').on('click', '#login-submit', login_handler);
    $('body').on('click', '#apply-submit', apply_handler);
    $('body').on('click', '#regdata-submit', regdata_handler);
    $('body').on('click', '#invite-add', invite_add_handler);
    $('body').on('click', '#invite-del', invite_del_handler);
    $('body').on('click', '#invite-submit', invite_handler);
    $('body').on('click', '#personal-submit', personal_handler);
    $('body').on('click', '#toggle-group-table', toggle_group_table_handler);
    $('body').on('click', '#forget-submit', forget_handler);
    $('body').on('click', '#reset-submit', reset_handler);
    $('body').on('click', '#search-submit', search_handler);
    $('body').on('click', '#toggle-search-table', toggle_group_table_handler);
    $('body').on('click', '#export-button', export_handler);

    // show id-number field if needed
    $('body').on('click', '#accommodation', function() {
        var id_number_field = $('#id-number-field');
        if(this.checked)
            id_number_field.show();
        else
            id_number_field.hide();
        console.log(this.checked);
    });

    // click listener on <a>
    $('.nav').on('click', 'a', function() {
        var href = $(this).attr('href');
        var index = href.indexOf('#', 0);
        if(index !== -1) {
            href = href.substring(index);
            if(href === '#logout') {
                window.sessionStorage.removeItem('token');
                window.sessionStorage.removeItem('data');
                window.sessionStorage.removeItem('role');
                show_loggedout();
            }
            load_page(href.replace('#', ''));
        }
    });

    $('.section').on('click', '#forget-passwd', function() {
        var href = $(this).attr('href');
        var index = href.indexOf('#', 0);
        if(index !== -1) {
            href = href.substring(index);
            load_page(href.replace('#', ''));
        } else {
            window.open(href.replace('#', ''));
        }
    });

    // show logout button if users logged in
    // hide login button if users logged in
    if(window.sessionStorage.getItem('token')) {
        show_loggedin();
    };

    // load page by hash
    hash_handler();
});

var load_page = function(page) {
    var section = $('.section');

    $.ajax({url: page + '.html', type: 'get', statusCode: {
        200: function(data) {
            section.empty();
            section.html(data);
            
            switch(page) {
                case 'apply':
                    apply_init();
                    break;
                case 'invite':
                    invite_init();
                    break;
                case 'personal':
                    var user = getUrlParameter('user');
                    user = (user !== undefined)? user: '';
                    personal_init(user);
                    break;
                case 'group':
                    group_init();
                    break;
                case 'regdata':
                    $('#t-shirt').dropdown();
                    break;
                case 'login':
                    // keypress listener
                    $('input').on("keypress", login_handler);
                    break;
            }
        },
        404: function() {
            section.html('404 not found - ' + page);
        }
    }});
};

var show_errormsg = function(message) {
    var errormsg = $('#error-msg');
    errormsg.html(message);
    $('.negative.message').show();
};

var show_loggedin = function() {
    $('body #nav-login').hide();
    $('body #nav-reg').show();
    $('body #nav-logout').show();
    $('body #nav-personal').show();
    $('body #nav-group').css('display', 'inline-block');
    $('body #nav-search').show();
    // enable dropdown
    $('body .ui.dropdown.item').dropdown();

    var role = JSON.parse(window.sessionStorage.getItem('role'));
    //console.log(role)
    if($.inArray('admin', role) != -1) {
        $('body #nav-invite').show();
    }

    var data = window.sessionStorage.getItem('data');
    if(data == "true") {
        $('body #nav-reg').hide();
    }
};

var show_loggedout = function() {
    $('body #nav-logout').hide();
    $('body #nav-reg').hide();
    $('body #nav-login').show();
    $('body #nav-invite').hide();
    $('body #nav-personal').hide();
    $('body #nav-group').hide();
    $('body #nav-search').hide();
};

var hash_handler = function() {
    var hash = location.hash.replace('#', '');
    
    if(hash !== '') {
        load_page(hash);
        console.log(hash);
    } else {
        load_page('useful');
    }
};

var getUrlParameter = function(sParam) {
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) {
            return sParameterName[1];
        }
    }
}          


var test_handler = function(event) {
}
// for login
var login_handler = function(event) {
    //event.preventDefault();
    console.log("event.keyCode: " + event.keyCode);
    if (event.keyCode !== 13 && event.keyCode !== undefined) {
      return;
    }
    var data = { 'user': $('#login-user').val(), 'passwd': $('#login-passwd').val() };

    $.ajax({url: baseUrl + '/login', 
            type: 'post',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            data: JSON.stringify(data),
            success: function(resp) { 
                if(!resp['exception']) {
                    var storage = window.sessionStorage;
                    storage.setItem('token', resp['token']);
                    storage.setItem('data', resp['data']);
                    storage.setItem('role', JSON.stringify(resp['role']));
                    show_loggedin();
                    if(resp['data'] == false) {
                        window.history.replaceState({}, '', '#regdata');
                        load_page('regdata');        
                    } else {
                        window.history.replaceState({}, '', '#test');
                        load_page('test');
                    }
                } else {
                    show_errormsg(resp['exception']);
                }
            }
    });
};

// for apply
var apply_handler = function(event) {
    event.preventDefault();
    $('.negative.message').hide();

    if($('#apply-passwd').val() !== $('#confirm-passwd').val()) {
        show_errormsg('wrong password');
        return;
    }
    var data = { 'user': $('#apply-user').val(), 
                 'passwd': $('#apply-passwd').val(), 
                 'role': $('#apply-team').val(),
                 'email': $('#apply-email').val() };

    apply_token = getUrlParameter('apply');   

    $.ajax({url: baseUrl + '/apply/' + getUrlParameter('apply'),
            type: 'post',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            data: JSON.stringify(data),
            success: function(resp) {
                if(!resp['exception']) {
                    load_page('login');
                } else {
                    show_errormsg(resp['exception']);
                }
            }
    });
};

var apply_init = function() {
    apply_token = getUrlParameter('apply');   
    //console.log(apply_token);
    
    $.ajax({url: baseUrl + '/apply/' + apply_token,
            type: 'get',
            dataType: 'json',
            success: function(resp) {
                if(!resp['exception']) {
                    $('#apply-email').val(resp['email']);
                    $('#apply-team').val(resp['team']);
                }
            }
    });
};

// for regdata
var regdata_handler = function(event) {
    event.preventDefault();
    $('.negative.message').hide();

    var data = { 'food': 'meat',
                 'traffic': false,
                 'certificate': false,
                 'accommodation': false,
                 'commuting': false,
                 'new': false,
                 'language': [],
                 'team': [],
                 'skill': [],
                 'others': ''
    };
    
    var form_data = $('form').serializeArray();

    for(var key in form_data) {
        var tmp = form_data[key];

        switch(tmp['name']) {
            case 'team':
                data['team'].push(tmp['value']);
                break;
            case 'certificate':
                data['certificate'] = true;
                break;
            case 'accommodation':
                data['accommodation'] = true;
                break;
            case 'traffic':
                data['traffic'] = true;
                break;
            case 'new':
                data['new'] = true;
                break;
            case 'language':
                if(tmp['value'] !== 'language-other')
                    data['language'].push(tmp['value']);
                break;
            case 'language-other':
                if(tmp['value'] !== '')
                    data['language'].push(tmp['value']);
                break;
            case 'food-other':
                if(tmp['value'] !== '')
                    data['food'] = tmp['value'];
                break;
            case 'skill':
                if(tmp['value'] !== 'skill-other')
                    data['skill'].push(tmp['value']);
                break;
            case 'skill-other':
                if(tmp['value'] !== '')
                    data['skill'].push(tmp['value']);
                break;
            case 'birthday':
                data['birthday'] = (tmp['value'] == "0")? 0: 1;
                break;
            case 't-shirt-other':
                if(tmp['value'] !== '' && form_data['t-shirt'] == 't-shirt-other')
                    data['t-shirt'] = tmp['value'];
                break;
            case 'commuting-time':
                data['commuting'] = true;
                break;
            case 'id-number':
                if(tmp['value'] !== '')
                    data['id-number'] = tmp['value'];
                break;
            default:
                data[tmp['name']] = tmp['value'];
                break;

        }
    }

    //console.log(window.sessionStorage.getItem('token'));
    var authorization = window.sessionStorage.getItem('token');
    $.ajax({url: baseUrl + '/user',
            headers: { 'Token': authorization },
            type: 'post',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            data: JSON.stringify(data),
            success: function(resp) {
                if(!resp['exception']) {
                    alert('Saved!');
                    window.sessionStorage.setItem('data', true);
                    $('#nav-reg').hide();
                    load_page('useful');
                } else {
                    show_errormsg(resp['exception']);
                }
            },
    });
};

// for invite
var invite_add_handler = function() {
    $('#invite-info').clone(false).removeAttr('id').appendTo('#invite-fields');
};

var invite_del_handler = function() {
    var count = $('.two.fields').length;
    if(count > 1)
        $('#invite-fields .two.fields:last').remove();
};

var invite_handler = function(e) {
    e.preventDefault();
    var authorization = window.sessionStorage.getItem('token');
    var data = [];
    var team = [];

    $('input[name=team]:checked').each(function() {
        team.push($(this).val());
    });

    $('.two.fields').each(function() {
        var nickname = $(this).find('input[name=nickname]').val();
        var email = $(this).find('input[name=email]').val();
        if(nickname !== '' && email !== '')
            data.push({'nickname': nickname, 'email': email, 'team': team });
    });

    //console.log(JSON.stringify(data));

    $.ajax({url: baseUrl + '/invite',
            type: 'post',
            headers: { 'Token': authorization },
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            data: JSON.stringify(data),
            success: function(resp) {
                if(!resp['exception']) {
                    //console.log(JSON.stringify(resp['email']));
                    $('form').trigger('reset');
                    alert('ok');
                } else {
                    alert(resp['exception'])
                }
            }
    });
};

var invite_init = function() {
};

// for personal
var personal_init = function(target_user) {
    
    var endpoint = '/user';
    if (target_user !== '') endprint = endpoint + '/';
    $('#t-shirt').dropdown();

    var authorization = window.sessionStorage.getItem('token');
    $.ajax({url: baseUrl + endpoint + target_user,
            type: 'get',
            headers: { 'Token': authorization },
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            success: function(resp) {
                var size = ['xs', 's', 'm', 'l', 'xl', '2xl', '3xl'];
                var food = ['meat', 'vegetarian', 'meat-no-beef', 'meat-no-pork'];
                var skill = ['medical', 'law', 'pr'];
                var language = ['english', 'japanese', 'taiwanese', 'cantonese'];
                if(!resp['exception']) {
                    for(var key in resp) {
                        if(typeof resp[key] == 'string') {
                            switch(key) {
                                case 'food':
                                    if(food.indexOf(resp[key]) == -1) {
                                        $('#food-other').prop('checked', true);
                                        $('#food-other-msg').val(resp[key]);
                                    } else {
                                        $('#'+resp[key]).prop('checked', true);
                                    }
                                    break;
                                case 't-shirt':
                                    $('#t-shirt').dropdown('set selected', resp[key]);
                                    break;
                                case 'gender':
                                    $('#'+resp[key]).prop('checked', true);
                                    break;
                                default:
                                    $('#'+key).val(resp[key].toString());
                                    break;
                            }
                        } else if(typeof resp[key] == 'object') {
                            for(var i in resp[key]) {
                                $('#'+resp[key][i]).prop('checked', true);
                                if(key == 'skill') {
                                    if(skill.indexOf(resp[key][i]) == -1) {
                                        $('#skill-other').prop('checked', true);
                                        $('#skill-other-msg').val(resp[key][i]);
                                    }
                                } else if(key == 'lanaguage') {
                                    if(lanaguage.indexOf(resp[key][i]) == -1) {
                                        $('#lanaguage-other').prop('checked', true);
                                        $('#lanaguage-other-msg').val(resp[key][i]);
                                    }
                                }
                            }
                        } else if(typeof resp[key] == 'boolean') {
                            $('#'+key).prop('checked', resp[key]);
                            if(key == 'commuting') {
                                $('#commuting-time').prop('checked', resp[key]);
                            }
                        }
                    }
                } else {
                    alert(resp['exception']);
                }
            }
    });
};

var personal_handler = function(event) {
    event.preventDefault();
    $('.negative.message').hide();

    var data_value = $('#personal-submit').attr('data-value');
    data_value = data_value === undefined? '': data_value;

    var form_data = $('form').serializeArray();
    var data = personal_data_arrange(form_data);

    var endpoint = '/user';
    if (data_value !== '') endpoint = endpoint + '/'; 

    var authorization = window.sessionStorage.getItem('token');
    $.ajax({url: baseUrl + endpoint + data_value,
            headers: { 'Token': authorization },
            type: 'PUT',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            data: JSON.stringify(data),
            success: function(resp) {
                if(!resp['exception']) {
                    alert('Saved!');
                    window.sessionStorage.setItem('data', true);
                    $('#nav-reg').hide();
                    if (data_value === '')  {
                        load_page('personal');
                    } else {
                        //load_page('group');
                        location.reload();
                    }
                } else {
                    show_errormsg(resp['exception']);
                }
            },
    });
};

var personal_data_arrange = function(form_data) {
    var data = { 'food': 'meat',
                 'traffic': false,
                 'certificate': false,
                 'accommodation': false,
                 'commuting': false,
                 'language': [],
                 'team': [],
                 'skill': [],
    };
    
    for(var key in form_data) {
        var tmp = form_data[key];

        switch(tmp['name']) {
            case 'method':
                method = tmp['value'];
                break;
            case 'team':
                data['team'].push(tmp['value']);
                break;
            case 'certificate':
                data['certificate'] = true;
                break;
            case 'accommodation':
                data['accommodation'] = true;
                break;
            case 'traffic':
                data['traffic'] = true;
                break;
            case 'new':
                data['new'] = true;
                break;
            case 'language':
                if(tmp['value'] !== 'language-other')
                    data['language'].push(tmp['value']);
                break;
            case 'language-other':
                if(tmp['value'] !== '')
                    data['language'].push(tmp['value']);
                break;
            case 'food-other':
                if(tmp['value'] !== '')
                    data['food'] = tmp['value'];
                break;
            case 'skill':
                if(tmp['value'] !== 'skill-other')
                    data['skill'].push(tmp['value']);
                break;
            case 'skill-other':
                if(tmp['value'] !== '')
                    data['skill'].push(tmp['value']);
                break;
            case 'birthday':
                data['birthday'] = (tmp['value'] == "0")? 0: 1;
                break;
            case 't-shirt-other':
                if(tmp['value'] !== '' && form_data['t-shirt'] == 't-shirt-other')
                    data['t-shirt'] = tmp['value'];
                break;
            case 'commuting-time':
                data['commuting'] = true;
                break;
            case 'id-number':
                if(tmp['value'] !== '')
                    data['id-number'] = tmp['value'];
                break;
            default:
                data[tmp['name']] = tmp['value'];
                break;

        }
    }

    //console.log(JSON.stringify(data));
    return data;
};

var group_init = function() {
    target_group = getUrlParameter('group');
    var authorization = window.sessionStorage.getItem('token');

    //$.ajax({url: baseUrl + '/users/' + target_group,
    $.ajax({url: baseUrl + '/search/?team='+ target_group,
            headers: { 'Token': authorization },
            type: 'GET',
            dataType: 'json',
            success: function(resp) {
                if(!resp['exception']) {
                    var users = resp['users'];
                    var count = 0;
                    for (var key in users) {
                        count++;
                        var data = users[key];
                        var tbody = $('#member-content');
                        var content = '<tr>';
                        //content+='<td><div class="ui primary button" data-value="'+data['id']+'"><i class="save icon"></i></div></td>';
                        content+='<td>&nbsp;</td>';
                        content+='<td>'+count+'</td>';
                        content+='<td>'+data['id']+'</td>';
                        content+='<td>'+undefined_checker(data['email'])+'</td>';
                        content+='<td>'+data['redmine']+'</td>';
                        content+='<td>'+data['nickname']+'</td>';
                        content+='<td>'+undefined_checker(data['last_name'])+'</td>';
                        content+='<td>'+undefined_checker(data['first_name'])+'</td>';
                        content+='<td>'+undefined_checker(data['gender'])+'</td>';
                        content+='<td>'+undefined_checker(data['phone'])+'</td>';
                        content+='<td>'+undefined_checker(data['id-number'])+'</td>';
                        content+='<td>'+data['team']+'</td>';
                        content+='<td>'+undefined_checker(data['food'])+'</td>';
                        content+='<td>'+undefined_checker(data['t-shirt'])+'</td>';
                        content+='<td>'+undefined_checker(data['certificate'])+'</td>';
                        content+='<td>'+undefined_checker(data['accommodation'])+'</td>';
                        content+='<td>'+undefined_checker(data['traffic'])+'</td>';
                        content+='<td>'+undefined_checker(data['commuting'])+'</td>';
                        content+='<td>'+undefined_checker(data['origin'])+'</td>';
                        content+='<td>'+undefined_checker(data['language'])+'</td>';
                        content+='<td>'+undefined_checker(data['skill'])+'</td>';
                        content+='</tr>';
                        tbody.append(content);
                    }
                    $('#member-content').on('click', '.ui.primary.button', group_item_handler);
                } else {
                    show_errormsg(resp['exception']);
                }
            }
    });
};

var group_item_handler = function() {
    var clicked_item = $(this);
    var data_value = clicked_item.attr('data-value');
    $('#personal-modal-content').empty();
    $.ajax({url: 'personal.html', type: 'get', statusCode: {
        200: function(data) {
            $('#personal-modal-content').empty();
            $('#personal-modal-content').html(data);
            $('#personal-submit').attr('data-value', data_value);
            personal_init(data_value);
            $('#personal-modal').modal('show');
        },
        400: function() {
            section.html('404 not found');
        }
    }});
};
    
var toggle_group_table_handler = function() {
    $('th:nth-child(n+10)').toggle();
    $('td:nth-child(n+10)').toggle();
};

var forget_handler = function() {
    var data = { 'user': $('#forget-user').val(), 'email': $('#forget-email').val() };
    var authorization = window.sessionStorage.getItem('token');
    $.ajax({url: baseUrl + '/resetpasswd',
            headers: { 'Token': authorization },
            type: 'POST',
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(data),
            dataType: 'json',
            success: function(resp) {
                if(!resp['exception']) {
                    load_page('forget_result');
                } else {
                    show_errormsg(resp['exception']);
                }
            }
    });
};

var reset_handler = function() {
    var data = { 'user': $('#reset-user').val(), 'passwd': $('#reset-passwd').val() };
    var token = getUrlParameter('r');
    $.ajax({url: baseUrl + '/resetpasswd/' + token,
            type: 'POST',
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(data),
            dataType: 'json',
            success: function(resp) {
                if(!resp['exception']) {
                    load_page('login');
                } else {
                    show_errormsg(resp['exception']);
                }
    
            }
    });
};

var search_handler = function(event) {
    event.preventDefault();
    $('.negative.message').hide();
    $('#search-content').empty();
    $('th:nth-child(n+10)').hide();
    $('td:nth-child(n+10)').hide();
    var form_data = $('form').serializeArray();
    var data = {};

    // parsing array
    for(var key in form_data) {
        var tmp = form_data[key];
        switch(tmp['name']) {
            // string
            case 'id':
            case 'email':
            case 'redmine':
                var checkbox_name = 'search-' + tmp['name'] + '-checkbox';
                var query = "input[name='" + checkbox_name + "']";
                data[tmp['name']] = ($(query).prop('checked'))? null: tmp['value'];
                break;
            case 'gender':
            case 'food':
            case 't-shirt':
                var checkbox_name = 'search-' + tmp['name'] + '-checkbox';
                var query = "input[name='" + checkbox_name + "']";
                data[tmp['name']] = ($(query).prop('checked'))? null: tmp['value'].toLowerCase();
                break;
            // boolean
            case 'food':
            case 'certificate':
            case 'accommodation':
            case 'traffic':
            case 'commuting':
                var checkbox_name = 'search-' + tmp['name'] + '-checkbox';
                var query = "input[name='" + checkbox_name + "']";
                if($(query).prop('checked')) {
                    data[tmp['name']] = null;
                } else {
                    if(tmp['value'] === "") {
                        data[tmp['name']] = "";
                    } else {
                        data[tmp['name']] = (tmp['value'].toLowerCase() === 'true');
                    }
                }
                break;
            // list
            case 'team':
                var checkbox_name = 'search-' + tmp['name'] + '-checkbox';
                var query = "input[name='" + checkbox_name + "']";
                if($(query).prop('checked')) {
                    data[tmp['name']] = null;
                } else {
                    data[tmp['name']] = tmp['value'].replace(/ /g, '').split(',');
                }
                break;
            default:
                break;
        }
    }

    var search_string = ''
    for(var key in data) {
        search_string += key + '=' + data[key] + '&';
    }
    // send ajax and generate the result
    var authorization = window.sessionStorage.getItem('token');
    $.ajax({url: baseUrl + '/search/?' + search_string, 
            headers: { 'Token': authorization },
            type: 'get',
            dataType: 'json',
            success: function(resp) {
                if(!resp['exception']) {
                    var users = resp['users'];
                    // set result to sessionStorage for creating csv file
                    window.sessionStorage.setItem('search_result', JSON.stringify(resp['users']));
                    var count = 0;
                    for (var key in users) {
                        count++;
                        var data = users[key];
                        var tbody = $('#search-content');
                        var content = '<tr>';
                        //content+='<td><div class="ui primary button" data-value="'+data['id']+'"><i class="save icon"></i></div></td>';
                        content+='<td>&nbsp;</td>';
                        content+='<td>'+count+'</td>';
                        content+='<td>'+data['id']+'</td>';
                        content+='<td>'+undefined_checker(data['email'])+'</td>';
                        content+='<td>'+data['redmine']+'</td>';
                        content+='<td>'+data['nickname']+'</td>';
                        content+='<td>'+undefined_checker(data['last_name'])+'</td>';
                        content+='<td>'+undefined_checker(data['first_name'])+'</td>';
                        content+='<td>'+undefined_checker(data['gender'])+'</td>';
                        content+='<td>'+undefined_checker(data['phone'])+'</td>';
                        content+='<td>'+undefined_checker(data['id-number'])+'</td>';
                        content+='<td>'+data['team']+'</td>';
                        content+='<td>'+undefined_checker(data['food'])+'</td>';
                        content+='<td>'+undefined_checker(data['t-shirt'])+'</td>';
                        content+='<td>'+undefined_checker(data['certificate'])+'</td>';
                        content+='<td>'+undefined_checker(data['accommodation'])+'</td>';
                        content+='<td>'+undefined_checker(data['traffic'])+'</td>';
                        content+='<td>'+undefined_checker(data['commuting'])+'</td>';
                        content+='<td>'+undefined_checker(data['origin'])+'</td>';
                        content+='<td>'+undefined_checker(data['language'])+'</td>';
                        content+='<td>'+undefined_checker(data['skill'])+'</td>';
                        content+='</tr>';
                        tbody.append(content);
                    }
                    $('#search-content').on('click', '.ui.primary.button', group_item_handler);
                } else {
                    show_errormsg(resp['exception']);
                }
            },
    });
};

var undefined_checker = function(data) {
    if((typeof data == 'undefined') ||
            (data == null))
        return "隱藏";
    else
        return data
};

var export_handler = function(data) {
    var users = JSON.parse(window.sessionStorage.getItem('search_result'));
    var csvContent = "data:text/csv;charset=utf-8,\ufeff";

    fields_header.forEach(function(field_name, index) {
        csvContent += fields_header_translation[field_name] + ','
    });
    
    csvContent += '\n';

    users.forEach(function(user, index) {
        
        for (var i = 0; i < fields_header.length; i++) {
            var key = fields_header[i];
            var value = (user[key] !== undefined)? '' + user[key]: '';
            csvContent += '"' + escapeRegExp(value.replace('#','')) +  '",';
        }
        csvContent += '\n';
    });
    
    var encodeUri = encodeURI(csvContent);
    window.open(encodeUri);
};

var escapeRegExp = function(str) {
    return str.replace(/([#",\/\\])/g, "\\$1");
}
