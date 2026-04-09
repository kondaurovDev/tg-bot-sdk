// Package tgapi provides a typed Telegram Bot API client for Go.
//
// The client uses a generic Execute function with typed method descriptors,
// ensuring compile-time type safety for API calls:
//
//	client := tgapi.NewClient("YOUR_BOT_TOKEN")
//	result, err := tgapi.Execute(client, tgapi.SendMessage, tgapi.SendMessageInput{
//	    ChatID: tgapi.Int(12345),
//	    Text:   "Hello!",
//	})
package tgapi

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"
)

// ApiMethod describes a Telegram Bot API method with typed input and output.
type ApiMethod[In any, Out any] struct {
	Name string
}

// Result wraps the Telegram Bot API response.
type Result[T any] struct {
	Ok          bool    `json:"ok"`
	ErrorCode   *int    `json:"error_code,omitempty"`
	Description *string `json:"description,omitempty"`
	Data        T       `json:"result"`
}

// Client is the Telegram Bot API HTTP client.
type Client struct {
	Token   string
	BaseURL string
	HTTP    *http.Client
}

// NewClient creates a new Telegram Bot API client with default settings.
func NewClient(token string) *Client {
	return &Client{
		Token:   token,
		BaseURL: "https://api.telegram.org",
		HTTP:    http.DefaultClient,
	}
}

// Execute calls a Telegram Bot API method with typed input and output.
func Execute[In any, Out any](c *Client, method ApiMethod[In, Out], input In) (*Result[Out], error) {
	body, err := json.Marshal(input)
	if err != nil {
		return nil, fmt.Errorf("marshal input: %w", err)
	}

	url := fmt.Sprintf("%s/bot%s/%s", c.BaseURL, c.Token, method.Name)

	req, err := http.NewRequest(http.MethodPost, url, bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("create request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, fmt.Errorf("execute request: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("read response: %w", err)
	}

	var result Result[Out]
	if err := json.Unmarshal(respBody, &result); err != nil {
		return nil, fmt.Errorf("unmarshal response: %w", err)
	}

	return &result, nil
}

// IntOrString represents a value that can be either int64 or string.
// Used for fields like chat_id that accept both formats.
type IntOrString struct {
	IntValue    int64
	StringValue string
	IsString    bool
}

// Int creates an IntOrString from an int64 value.
func Int(v int64) IntOrString {
	return IntOrString{IntValue: v}
}

// Str creates an IntOrString from a string value.
func Str(v string) IntOrString {
	return IntOrString{StringValue: v, IsString: true}
}

func (v IntOrString) MarshalJSON() ([]byte, error) {
	if v.IsString {
		return json.Marshal(v.StringValue)
	}
	return json.Marshal(v.IntValue)
}

func (v *IntOrString) UnmarshalJSON(data []byte) error {
	var s string
	if err := json.Unmarshal(data, &s); err == nil {
		v.StringValue = s
		v.IsString = true
		return nil
	}

	var n int64
	if err := json.Unmarshal(data, &n); err == nil {
		v.IntValue = n
		v.IsString = false
		return nil
	}

	return fmt.Errorf("IntOrString: cannot unmarshal %s", string(data))
}

func (v IntOrString) String() string {
	if v.IsString {
		return v.StringValue
	}
	return strconv.FormatInt(v.IntValue, 10)
}

// InputFile represents a file to upload to the Telegram API.
type InputFile struct {
	FileContent []byte
	FileName    string
}
